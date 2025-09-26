-- Tickrify Database Schema

-- Tabela de usuários (complementar ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar RLS (Row Level Security) para usuários
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários
CREATE POLICY "Usuários podem ver seus próprios dados"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    price_id TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'trader', 'alpha_pro')),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    active_until TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar RLS para assinaturas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para assinaturas
CREATE POLICY "Usuários podem ver suas próprias assinaturas"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Tabela de análises
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    symbol TEXT NOT NULL,
    recommendation TEXT NOT NULL CHECK (recommendation IN ('BUY', 'SELL', 'HOLD')),
    confidence FLOAT NOT NULL,
    target_price FLOAT NOT NULL,
    stop_loss FLOAT NOT NULL,
    timeframe TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reasoning TEXT NOT NULL,
    image_url TEXT,
    technical_indicators JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar RLS para análises
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para análises
CREATE POLICY "Usuários podem ver suas próprias análises"
    ON analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias análises"
    ON analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Tabela de limites de uso
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    month_year TEXT NOT NULL, -- formato: 'MM-YYYY'
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, month_year)
);

-- Adicionar RLS para limites de uso
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para limites de uso
CREATE POLICY "Usuários podem ver seus próprios limites de uso"
    ON usage_limits FOR SELECT
    USING (auth.uid() = user_id);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active_until ON subscriptions(active_until);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id_month_year ON usage_limits(user_id, month_year);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela para idempotência de webhooks Stripe (evita reprocessar eventos)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id TEXT PRIMARY KEY,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de sinais gerados (usada pelo frontend)
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    symbol TEXT NOT NULL,
    type TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    price FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT,
    description TEXT
);

-- RLS para signals
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios sinais"
    ON signals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios sinais"
    ON signals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Índice para signals
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);


