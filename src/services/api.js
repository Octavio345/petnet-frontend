// services/api.js - VERSÃO COMPLETA E CORRIGIDA
const API_BASE_URL = 'http://localhost:3001';

// Função com debug para ver as requisições
async function fetchAPI(endpoint, options = {}) {
  console.log(`🔄 Fazendo requisição para: ${API_BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`📥 Resposta status: ${response.status}`);
    
    // Verificar se a resposta tem conteúdo
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log(`📦 Resposta data:`, data);
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status} na requisição`);
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro API ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Login tradicional
  async login(email, senha) {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
  },

  // Login com Google
  async loginGoogle(token) {
    return fetchAPI('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  // Registrar usuário
  async register(email, senha, nome) {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, senha, nome })
    });
  },

  // Verificar token
  async verifyToken(token) {
    return fetchAPI('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Helper para verificar se usuário está logado
export const authHelper = {
  isLoggedIn() {
    return !!localStorage.getItem('usuario_id');
  },

  getUserInfo() {
    return {
      id: localStorage.getItem('usuario_id'),
      nome: localStorage.getItem('usuario_nome'),
      email: localStorage.getItem('usuario_email'),
      token: localStorage.getItem('auth_token')
    };
  },

  setUserInfo(usuario, token = null) {
    localStorage.setItem('usuario_id', usuario.id);
    localStorage.setItem('usuario_nome', usuario.nome);
    localStorage.setItem('usuario_email', usuario.email);
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  },

  clearUserInfo() {
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('usuario_nome');
    localStorage.removeItem('usuario_email');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('carrinho');
  }
};

// AGENDAMENTOS
export const agendamentoAPI = {
  // Buscar serviços disponíveis
  async getServices() {
    return fetchAPI('/agendamentos/servicos');
  },

  // Buscar horários disponíveis
  async getAvailableSlots(data, servicoId) {
    return fetchAPI('/agendamentos/horarios', {
      method: 'POST',
      body: JSON.stringify({ data, servico_id: servicoId })
    });
  },

  // Criar agendamento
  async createAgendamento(agendamentoData) {
    return fetchAPI('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(agendamentoData)
    });
  },

  // Listar agendamentos do usuário
  async getUserAgendamentos(usuarioId = null) {
    const userId = usuarioId || localStorage.getItem('usuario_id');
    if (!userId) throw new Error('Usuário não identificado');
    
    return fetchAPI(`/agendamentos/usuario/${userId}`);
  },

  // Listar todos os agendamentos (admin)
  async getAllAgendamentos() {
    return fetchAPI('/agendamentos/todos');
  },

  // Cancelar agendamento
  async cancelAgendamento(agendamentoId) {
    return fetchAPI(`/agendamentos/${agendamentoId}/cancelar`, {
      method: 'PUT'
    });
  },

  // Atualizar agendamento
  async updateAgendamento(agendamentoId, dadosAtualizados) {
    return fetchAPI(`/agendamentos/${agendamentoId}`, {
      method: 'PUT',
      body: JSON.stringify(dadosAtualizados)
    });
  }
};

// HISTÓRICO - VERSÃO COMPLETAMENTE CORRIGIDA
export const historyAPI = {
  // Buscar reservas do usuário
  async getUserReservas(usuarioId = null) {
    try {
      const userId = usuarioId || localStorage.getItem('usuario_id');
      if (!userId) throw new Error('Usuário não identificado');
      
      console.log('🔍 Tentando buscar reservas...');
      
      // Primeiro tenta buscar da API real
      try {
        const reservas = await fetchAPI(`/agendamentos/usuario/${userId}`);
        console.log('✅ Reservas da API:', reservas);
        return reservas;
      } catch (apiError) {
        console.log('⚠️ API não disponível, buscando dados locais...');
        // Se API falhar, busca dados locais
        return this.getReservasLocais(userId);
      }
      
    } catch (error) {
      console.log('🔄 Buscando reservas locais...');
      return this.getReservasLocais(usuarioId);
    }
  },

  // Buscar compras do usuário
  async getUserCompras(usuarioId = null) {
    try {
      const userId = usuarioId || localStorage.getItem('usuario_id');
      if (!userId) throw new Error('Usuário não identificado');
      
      console.log('🔍 Tentando buscar compras...');
      
      // Primeiro tenta buscar da API real
      try {
        const compras = await fetchAPI(`/compras/usuario/${userId}`);
        console.log('✅ Compras da API:', compras);
        return compras;
      } catch (apiError) {
        console.log('⚠️ API não disponível, buscando dados locais...');
        // Se API falhar, busca dados locais
        return this.getComprasLocais(userId);
      }
      
    } catch (error) {
      console.log('🔄 Buscando compras locais...');
      return this.getComprasLocais(usuarioId);
    }
  },

  // ✅ FUNÇÃO CORRIGIDA: Buscar compras do localStorage SEM DUPLICAÇÃO
  getComprasLocais(usuarioId) {
    try {
      const comprasSalvas = JSON.parse(localStorage.getItem('compras_reais') || '[]');
      
      // Filtrar compras do usuário atual
      const comprasDoUsuario = comprasSalvas.filter(compra => {
        const compraUserId = compra.usuario_id || compra.userId;
        return compraUserId && compraUserId.toString() === usuarioId.toString();
      });
      
      console.log('📦 Compras locais encontradas:', comprasDoUsuario.length);
      
      // ✅ REMOVER DUPLICATAS por número do pedido
      const comprasUnicas = this.removerDuplicatas(comprasDoUsuario, 'numero_pedido');
      console.log('✅ Compras após remover duplicatas:', comprasUnicas.length);
      
      // ✅ CORRIGIR ESTRUTURA DAS COMPRAS
      const comprasCorrigidas = comprasUnicas.map(compra => {
        // Se não tem produtos mas tem itens, converter estrutura
        let produtos = [];
        
        if (compra.produtos && Array.isArray(compra.produtos)) {
          produtos = compra.produtos.map(prod => ({
            nome: prod.nome || 'Produto não especificado',
            quantidade: Number(prod.quantidade || 1),
            preco: Number(prod.preco || 0),
            total: Number(prod.total || (prod.preco || 0) * (prod.quantidade || 1))
          }));
        } else if (compra.itens && Array.isArray(compra.itens)) {
          produtos = compra.itens.map(item => ({
            nome: item.nome || item.title || 'Produto não especificado',
            quantidade: Number(item.quantity || item.quantidade || 1),
            preco: Number(item.preco || item.unit_price || item.price || 0),
            total: Number(item.total || (item.quantity || 1) * (item.preco || 0))
          }));
        } else {
          // Se não tem produtos definidos, criar um produto padrão
          produtos = [{
            nome: 'Produtos diversos',
            quantidade: 1,
            preco: Number(compra.total || compra.valor_total || 0),
            total: Number(compra.total || compra.valor_total || 0)
          }];
        }
        
        // Calcular totais se não existirem
        const subtotal = compra.subtotal || produtos.reduce((sum, produto) => sum + (produto.total || 0), 0);
        const frete = Number(compra.frete || 0);
        const valor_total = compra.valor_total || compra.total || (subtotal + frete);
        
        return {
          ...compra,
          id: compra.id || `comp_${Date.now()}`,
          numero_pedido: compra.numero_pedido || `CMP${compra.id || Date.now()}`,
          data: compra.data || compra.data_criacao || new Date().toISOString(),
          produtos: produtos,
          subtotal: subtotal,
          frete: frete,
          valor_total: valor_total,
          status: compra.status || 'confirmado',
          tipo: compra.tipo || 'produtos',
          usuario_id: compra.usuario_id || usuarioId
        };
      });
      
      // Ordenar por data (mais recente primeiro)
      return comprasCorrigidas.sort((a, b) => new Date(b.data) - new Date(a.data));
      
    } catch (error) {
      console.error('❌ Erro ao buscar compras locais:', error);
      return [];
    }
  },

  // ✅ FUNÇÃO CORRIGIDA: Buscar reservas do localStorage SEM DUPLICAÇÃO
  getReservasLocais(usuarioId) {
    try {
      const reservasSalvas = JSON.parse(localStorage.getItem('reservas_reais') || '[]');
      
      // Filtrar reservas do usuário atual
      const reservasDoUsuario = reservasSalvas.filter(reserva => {
        const reservaUserId = reserva.usuario_id || reserva.userId;
        return reservaUserId && reservaUserId.toString() === usuarioId.toString();
      });
      
      console.log('📅 Reservas locais encontradas:', reservasDoUsuario.length);
      
      // ✅ REMOVER DUPLICATAS por ID ou número do pedido
      const reservasUnicas = this.removerDuplicatas(reservasDoUsuario, 'id');
      console.log('✅ Reservas após remover duplicatas:', reservasUnicas.length);
      
      // ✅ CORRIGIR ESTRUTURA DAS RESERVAS
      const reservasCorrigidas = reservasUnicas.map(reserva => ({
        ...reserva,
        id: reserva.id || `res_${Date.now()}`,
        numero_pedido: reserva.numero_pedido || `RES${reserva.id || Date.now()}`,
        data_criacao: reserva.data_criacao || new Date().toISOString(),
        servico_nome: reserva.servico_nome || 'Serviço Pet',
        valor_total: Number(reserva.valor_total || 0),
        status: reserva.status || 'confirmado',
        observacoes: reserva.observacoes || '',
        usuario_id: reserva.usuario_id || usuarioId
      }));
      
      // Ordenar por data (mais recente primeiro)
      return reservasCorrigidas.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
      
    } catch (error) {
      console.error('❌ Erro ao buscar reservas locais:', error);
      return [];
    }
  },

  // ✅ NOVA FUNÇÃO: Remover duplicatas de array
  removerDuplicatas(array, chave) {
    const visto = new Set();
    return array.filter(item => {
      const identificador = item[chave] || item.id || item.numero_pedido;
      if (!identificador || visto.has(identificador)) {
        console.log('🗑️ Removendo duplicata:', identificador);
        return false;
      }
      visto.add(identificador);
      return true;
    });
  },

  // ✅ Dados mock para quando não há dados reais (apenas para demonstração)
  getComprasMock() {
    return [
      {
        id: 1,
        data: "2024-01-15T14:30:00",
        produtos: [
          { nome: "Foster 2kg", quantidade: 1, preco: 49.90, total: 49.90 },
          { nome: "Coleira guia", quantidade: 1, preco: 49.99, total: 49.99 }
        ],
        total: 109.89,
        status: "entregue",
        tipo: "produtos",
        numero_pedido: "PED20240001"
      }
    ];
  },

  getReservasMock() {
    return [
      {
        id: 1,
        servico_nome: "Banho e Tosa",
        data_agendamento: "2024-01-20T10:00:00",
        valor_total: "80.00",
        status: "confirmado",
        observacoes: "Tosa higiênica apenas",
        numero_pedido: "RES20240001"
      }
    ];
  }
};

// PAGAMENTOS
export const paymentAPI = {
  // Criar preferência de pagamento
  async createPaymentPreference(paymentData) {
    return fetchAPI('/api/pagamentos/create-preference', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  // Verificar status do pagamento
  async checkPaymentStatus(paymentId) {
    return fetchAPI(`/api/pagamentos/status/${paymentId}`);
  },

  // Processar webhook de pagamento
  async processPaymentWebhook(webhookData) {
    return fetchAPI('/api/pagamentos/webhook', {
      method: 'POST',
      body: JSON.stringify(webhookData)
    });
  }
};

// PRODUTOS E CARRINHO
export const productsAPI = {
  // Buscar todos os produtos
  async getProducts() {
    return fetchAPI('/produtos');
  },

  // Buscar produtos por categoria
  async getProductsByCategory(categoria) {
    return fetchAPI(`/produtos/categoria/${categoria}`);
  },

  // Buscar detalhes do produto
  async getProductDetails(productId) {
    return fetchAPI(`/produtos/${productId}`);
  },

  // Salvar carrinho no backend
  async saveCart(cartData) {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) throw new Error('Usuário não logado');
    
    return fetchAPI('/carrinho/salvar', {
      method: 'POST',
      body: JSON.stringify({
        usuario_id: usuarioId,
        itens: cartData
      })
    });
  },

  // Recuperar carrinho do backend
  async getCart() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) throw new Error('Usuário não logado');
    
    return fetchAPI(`/carrinho/usuario/${usuarioId}`);
  }
};

// ✅ GERENCIADOR DE HISTÓRICO LOCAL CORRIGIDO
export const HistoryManager = {
  salvarCompraUnica(compraData) {
    try {
      const comprasExistentes = JSON.parse(localStorage.getItem('compras_reais') || '[]');
      const usuarioInfo = authHelper.getUserInfo();
      
      console.log('💾 Salvando compra:', compraData);
      
      // ✅ VERIFICAR SE JÁ EXISTE
      const compraExistenteIndex = comprasExistentes.findIndex(compra => 
        compra.numero_pedido === compraData.numero_pedido
      );
      
      if (compraExistenteIndex !== -1) {
        // Atualizar compra existente
        comprasExistentes[compraExistenteIndex] = {
          ...comprasExistentes[compraExistenteIndex],
          ...compraData,
          usuario_id: usuarioInfo.id
        };
      } else {
        // ✅ ESTRUTURA PADRONIZADA - CORRIGIDA
        const novaCompra = {
          id: compraData.numero_pedido || `CMP${Date.now()}`,
          numero_pedido: compraData.numero_pedido || `CMP${Date.now()}`,
          data: new Date().toISOString(),
          data_criacao: new Date().toISOString(),
          usuario_id: usuarioInfo.id,
          status: 'confirmado',
          tipo: 'produtos',
          
          // ✅ PRODUTOS CORRETAMENTE ESTRUTURADOS
          produtos: (compraData.produtos || []).map(produto => ({
            nome: produto.nome || 'Produto não especificado',
            quantidade: Number(produto.quantidade) || 1,
            preco: Number(produto.preco) || 0,
            total: Number(produto.total) || (Number(produto.quantidade) || 1) * (Number(produto.preco) || 0)
          })),
          
          // ✅ VALORES CORRETOS
          subtotal: Number(compraData.subtotal) || 0,
          frete: Number(compraData.frete) || 0,
          valor_total: Number(compraData.valor_total) || 0,
          
          // Informações adicionais
          endereco: compraData.endereco || {},
          metodo_pagamento: compraData.metodo_pagamento || 'Mercado Pago'
        };

        comprasExistentes.unshift(novaCompra);
      }

      localStorage.setItem('compras_reais', JSON.stringify(comprasExistentes));
      
      console.log('✅ Compra salva com sucesso:', comprasExistentes[0]);
      return comprasExistentes[0];
      
    } catch (error) {
      console.error('❌ Erro ao salvar compra:', error);
      throw error;
    }
  },

  // ✅ FUNÇÃO CORRIGIDA: Salvar reserva SEM DUPLICAÇÃO
  salvarReservaUnica(reservaData) {
    try {
      const reservasExistentes = JSON.parse(localStorage.getItem('reservas_reais') || '[]');
      const usuarioInfo = authHelper.getUserInfo();
      
      // ✅ VERIFICAR SE JÁ EXISTE
      const reservaExistente = reservasExistentes.find(reserva => 
        reserva.id === reservaData.id || 
        reserva.numero_pedido === reservaData.numero_pedido
      );
      
      if (reservaExistente) {
        console.log('📅 Reserva já existe no histórico:', reservaData.numero_pedido);
        return reservaExistente;
      }

      // ✅ ESTRUTURA PADRONIZADA DA RESERVA
      const novaReserva = {
        id: reservaData.id || Date.now(),
        numero_pedido: reservaData.numero_pedido || `RES${Date.now()}`,
        data_criacao: new Date().toISOString(),
        usuario_id: usuarioInfo.id,
        
        servico_id: reservaData.servico_id,
        servico_nome: reservaData.servico_nome || 'Serviço Pet',
        data_agendamento: reservaData.data_agendamento,
        valor_total: Number(reservaData.valor_total || 0),
        status: reservaData.status || 'confirmado',
        observacoes: reservaData.observacoes || '',
        
        // Informações do cliente
        nome_cliente: reservaData.nome_cliente || usuarioInfo.nome,
        email_cliente: reservaData.email_cliente || usuarioInfo.email
      };

      // ✅ ADICIONAR NO INÍCIO DO ARRAY E SALVAR
      reservasExistentes.unshift(novaReserva);
      localStorage.setItem('reservas_reais', JSON.stringify(reservasExistentes));
      
      console.log('✅ Reserva salva no histórico:', novaReserva);
      return novaReserva;
      
    } catch (error) {
      console.error('❌ Erro ao salvar reserva:', error);
      throw error;
    }
  },

  // ✅ FUNÇÃO PARA LIMPAR COMPRA ESPECÍFICA
  removerCompra(numeroPedido) {
    try {
      const compras = JSON.parse(localStorage.getItem('compras_reais') || '[]');
      const novasCompras = compras.filter(compra => compra.numero_pedido !== numeroPedido);
      localStorage.setItem('compras_reais', JSON.stringify(novasCompras));
      console.log('🗑️ Compra removida:', numeroPedido);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover compra:', error);
      return false;
    }
  },

  // ✅ FUNÇÃO PARA LIMPAR RESERVA ESPECÍFICA
  removerReserva(numeroPedido) {
    try {
      const reservas = JSON.parse(localStorage.getItem('reservas_reais') || '[]');
      const novasReservas = reservas.filter(reserva => reserva.numero_pedido !== numeroPedido);
      localStorage.setItem('reservas_reais', JSON.stringify(novasReservas));
      console.log('🗑️ Reserva removida:', numeroPedido);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover reserva:', error);
      return false;
    }
  },

  // Limpar histórico local (para testes)
  limparHistorico() {
    try {
      localStorage.removeItem('compras_reais');
      localStorage.removeItem('reservas_reais');
      console.log('🗑️ Histórico local limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar histórico:', error);
    }
  },

  // Estatísticas do histórico
  getEstatisticas(usuarioId) {
    try {
      const compras = JSON.parse(localStorage.getItem('compras_reais') || '[]');
      const reservas = JSON.parse(localStorage.getItem('reservas_reais') || '[]');
      
      const comprasUsuario = compras.filter(c => c.usuario_id === usuarioId);
      const reservasUsuario = reservas.filter(r => r.usuario_id === usuarioId);
      
      return {
        total_compras: comprasUsuario.length,
        total_reservas: reservasUsuario.length,
        valor_total_compras: comprasUsuario.reduce((sum, c) => sum + (c.valor_total || 0), 0),
        compras_recentes: comprasUsuario.slice(0, 5),
        reservas_recentes: reservasUsuario.slice(0, 5)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { total_compras: 0, total_reservas: 0, valor_total_compras: 0, compras_recentes: [], reservas_recentes: [] };
    }
  }
};

// Função global para verificar conexão com API
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ API não está respondendo:', error);
    return false;
  }
};

// Função para inicializar a API
export const initializeAPI = () => {
  console.log('🚀 Inicializando API PetNet...');
  
  // Verificar se usuário está logado
  const userInfo = authHelper.getUserInfo();
  if (userInfo.id) {
    console.log('👤 Usuário logado:', userInfo.nome);
    
    // Verificar histórico local
    const compras = JSON.parse(localStorage.getItem('compras_reais') || '[]');
    const reservas = JSON.parse(localStorage.getItem('reservas_reais') || '[]');
    console.log(`📊 Histórico local: ${compras.length} compras, ${reservas.length} reservas`);
  } else {
    console.log('🔒 Usuário não logado');
  }
  
  // Verificar saúde da API
  checkAPIHealth().then(healthy => {
    if (healthy) {
      console.log('✅ API está funcionando corretamente');
    } else {
      console.warn('⚠️ API pode estar offline - usando modo local');
    }
  });
};

// Exportação padrão com todas as APIs
export default {
  api,
  authHelper,
  agendamentoAPI,
  historyAPI,
  paymentAPI,
  productsAPI,
  HistoryManager,
  checkAPIHealth,
  initializeAPI
};