import { useState } from 'react';
import { BarChart3, Brain, Zap, Target, Star, ArrowRight, CheckCircle, TrendingUp, Users, Clock } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

export function Landing() {
	const [showAuth, setShowAuth] = useState(false);
	const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

	const handleGetStarted = () => {
		setAuthMode('register');
		setShowAuth(true);
	};

	const handleLogin = () => {
		setAuthMode('login');
		setShowAuth(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
			{/* Header */}
			<header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-3">
							<img src="/tickrify-logo-full.png" alt="Tickrify" className="h-12 sm:h-16 w-auto" />
						</div>
						<div className="flex items-center space-x-4">
							<SignInButton mode="modal">
								<button className="text-white hover:text-blue-200 transition-colors text-sm sm:text-base">
									Entrar
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-5 sm:px-6 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all transform hover:scale-105 text-sm sm:text-base">
									Começar Grátis
								</button>
							</SignUpButton>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative pt-20 pb-32 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-600/20"></div>
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div className="mb-8">
						<div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white mb-8">
							<Star className="w-5 h-5 text-yellow-400" />
							<span className="text-sm font-medium">Plataforma de Trading com IA</span>
						</div>
						<h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
							Trading com
							<span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"> IA Avançada</span>
						</h1>
						<p className="text-lg md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
							Análise técnica automatizada, sinais em tempo real e insights poderosos para maximizar seus resultados no trading.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<SignUpButton mode="modal">
								<button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl">
									<span className="flex items-center space-x-2">
										<span>Começar Grátis</span>
										<ArrowRight className="w-5 h-5" />
									</span>
								</button>
							</SignUpButton>
							<SignInButton mode="modal">
								<button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/30">
									Já tenho conta
								</button>
							</SignInButton>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20 bg-white/5 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
						<div className="text-white">
							<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<Users className="w-8 h-8" />
							</div>
							<h3 className="text-4xl font-bold mb-2">15,000+</h3>
							<p className="text-blue-200">Traders Ativos</p>
						</div>
						<div className="text-white">
							<div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<Target className="w-8 h-8" />
							</div>
							<h3 className="text-4xl font-bold mb-2">89.3%</h3>
							<p className="text-blue-200">Taxa de Acerto</p>
						</div>
						<div className="text-white">
							<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<Clock className="w-8 h-8" />
							</div>
							<h3 className="text-4xl font-bold mb-2">24/7</h3>
							<p className="text-blue-200">Monitoramento IA</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							Recursos Poderosos
						</h2>
						<p className="text-xl text-blue-200 max-w-3xl mx-auto">
							Tudo que você precisa para ter sucesso no trading, powered by IA
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
							<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
								<Brain className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold text-white mb-4">Análise IA Avançada</h3>
							<p className="text-blue-200">
								Upload de gráficos com análise automática por IA. Identifica padrões, suportes, resistências e gera recomendações precisas.
							</p>
						</div>
						<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
							<div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
								<Zap className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold text-white mb-4">Sinais em Tempo Real</h3>
							<p className="text-blue-200">
								Receba sinais de BUY/SELL automaticamente com níveis de confiança e análise técnica completa para cada recomendação.
							</p>
						</div>
						<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
							<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
								<TrendingUp className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold text-white mb-4">Dashboard Completo</h3>
							<p className="text-blue-200">
								Acompanhe performance, ROI, taxa de acerto e métricas detalhadas. Visualize seu progresso com gráficos interativos.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section className="py-20 bg-white/5 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							Escolha Seu Plano
						</h2>
						<p className="text-xl text-blue-200">
							Planos flexíveis para todos os tipos de trader
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Free Plan */}
						<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
							<div className="text-center mb-8">
								<h3 className="text-2xl font-bold text-white mb-2">Free</h3>
								<div className="text-4xl font-bold text-white mb-2">R$ 0</div>
								<p className="text-blue-200">para sempre</p>
							</div>
							<ul className="space-y-4 mb-8">
								<li className="flex items-center space-x-3 text-white">
									<CheckCircle className="w-5 h-5 text-emerald-400" />
									<span>10 análises por mês</span>
								</li>
								<li className="flex items-center space-x-3 text-white">
									<CheckCircle className="w-5 h-5 text-emerald-400" />
									<span>Análise IA básica</span>
								</li>
								<li className="flex items-center space-x-3 text-white">
									<CheckCircle className="w-5 h-5 text-emerald-400" />
									<span>Dashboard básico</span>
								</li>
							</ul>
							<SignUpButton mode="modal">
								<button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all">
									Começar Grátis
								</button>
							</SignUpButton>
						</div>
						{/* Trader Plan */}
						<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
							<div className="text-center mb-8">
								<h3 className="text-2xl font-bold text-white mb-2">Trader</h3>
								<div className="text-4xl font-bold text-white mb-2">R$ 59,90</div>
								<p className="text-blue-200">por mês</p>
							</div>
							<ul className="space-y-4 mb-8">
								<li className="flex items-center space-x-3 text-white">
									<CheckCircle className="w-5 h-5 text-emerald-400" />
									<span>Gráficos avançados em tempo real</span>
								</li>
								<li className="flex items-center space-x-3 text-white">
									<CheckCircle className="w-5 h-5 text-emerald-400" />
									<span>Alertas personalizados</span>
								</li>
								<li className="flex items-center space-x-3 text-white">
									<CheckCircle className="w-5 h-5 text-emerald-400" />
									<span>Análise técnica avançada</span>
								</li>
							</ul>
							<SignUpButton mode="modal">
								<button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all">
									Começar Agora
								</button>
							</SignUpButton>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Landing;

