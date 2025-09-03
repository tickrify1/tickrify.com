/**
 * Utilitários de validação e sanitização para o Tickrify
 * Melhora a segurança da aplicação validando entradas do usuário
 */

// Expressões regulares para validação
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Valida endereço de email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, message: 'Email é obrigatório' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: 'Email inválido' };
  }
  
  if (email.length > 100) {
    return { isValid: false, message: 'Email muito longo' };
  }
  
  return { isValid: true };
}

/**
 * Valida senha
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: 'Senha é obrigatória' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Senha muito longa' };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      isValid: false, 
      message: 'Senha deve conter pelo menos: 1 minúscula, 1 maiúscula e 1 número' 
    };
  }
  
  return { isValid: true };
}

/**
 * Valida nome
 */
export function validateName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, message: 'Nome é obrigatório' };
  }
  
  if (!NAME_REGEX.test(name)) {
    return { isValid: false, message: 'Nome deve conter apenas letras e espaços' };
  }
  
  return { isValid: true };
}

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limita tamanho
}

/**
 * Valida URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, message: 'URL é obrigatória' };
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Apenas HTTPS permitido
    if (parsedUrl.protocol !== 'https:') {
      return { isValid: false, message: 'Apenas URLs HTTPS são permitidas' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'URL inválida' };
  }
}

/**
 * Valida arquivo de upload
 */
export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { isValid: false, message: 'Arquivo é obrigatório' };
  }
  
  // Tipos permitidos
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: 'Apenas arquivos JPEG, PNG e WebP são permitidos' 
    };
  }
  
  // Tamanho máximo: 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, message: 'Arquivo muito grande (máximo 10MB)' };
  }
  
  return { isValid: true };
}

/**
 * Valida formulário de login
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  if (!password) {
    return { isValid: false, message: 'Senha é obrigatória' };
  }
  
  return { isValid: true };
}

/**
 * Valida formulário de registro
 */
export function validateRegisterForm(
  name: string, 
  email: string, 
  password: string
): ValidationResult {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  return { isValid: true };
}

/**
 * Rate limiting simples (lado cliente)
 */
const requestCounts = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now - record.lastReset > windowMs) {
    // Reset window
    requestCounts.set(key, { count: 1, lastReset: now });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

/**
 * Gera token CSRF simples
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Escapa HTML para prevenir XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Hook personalizado para validação em tempo real
 */
export function useValidation() {
  return {
    validateEmail,
    validatePassword,
    validateName,
    validateLoginForm,
    validateRegisterForm,
    validateFile,
    validateUrl,
    sanitizeString,
    escapeHtml,
    checkRateLimit,
    generateCSRFToken
  };
}
