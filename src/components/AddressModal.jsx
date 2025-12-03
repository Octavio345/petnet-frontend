import React, { useState } from 'react';
import '../styles/AddressModal.css';

const AddressModal = ({ isOpen, onConfirm, onCancel, subtotal }) => {
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');
  const [frete, setFrete] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [endereco, setEndereco] = useState(null);
  const [cepValido, setCepValido] = useState(true);
  const [numero, setNumero] = useState('');

  const buscarEnderecoPorCEP = async (cep) => {
    try {
      setCalculando(true);
      setCepValido(true);
      
      const cepNumeros = cep.replace(/\D/g, '');
      
      const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setCepValido(false);
        setEndereco(null);
        setFrete(null);
        return;
      }
      
      setEndereco({
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      });
      
      setFrete(9.90);
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepValido(false);
      setEndereco(null);
      setFrete(null);
    } finally {
      setCalculando(false);
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    
    setCep(value);
    
    if (value.length !== 9) {
      setEndereco(null);
      setFrete(null);
      setCepValido(true);
    }
  };

  const finalizar = () => {
    if (!numero) {
      alert('Por favor, informe o número do endereço');
      return;
    }

    if (!frete) {
      alert('Por favor, calcule o frete antes de continuar');
      return;
    }

    onConfirm({ 
      cep, 
      complemento, 
      frete,
      endereco: {
        ...endereco,
        numero
      }
    });
  };

  const total = subtotal + (frete || 0);

  if (!isOpen) return null;

  return (
    <div className="address-modal-overlay" onClick={onCancel}>
      <div className="address-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="address-modal-header">
          <div className="address-modal-icon">🚚</div>
          <div className="address-modal-title">
            <h2>Endereço de Entrega</h2>
            <p>Informe onde receber seus produtos</p>
          </div>
          <button className="address-modal-close" onClick={onCancel}>
            <span>&times;</span>
          </button>
        </div>

        <div className="address-modal-content">
          
          <div className="address-form">
            <div className="form-group-modern">
              <label className="form-label">
                <span className="label-icon">📮</span>
                CEP
              </label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  maxLength={9}
                  className={`form-input-modern ${!cepValido ? 'input-error' : ''}`}
                />
                <button 
                  onClick={() => buscarEnderecoPorCEP(cep)}
                  disabled={calculando || cep.length !== 9}
                  className={`cep-button ${calculando ? 'loading' : ''}`}
                >
                  {calculando ? (
                    <div className="spinner-small"></div>
                  ) : (
                    'Buscar'
                  )}
                </button>
              </div>
              {!cepValido && (
                <div className="error-message">
                  ❌ CEP não encontrado. Verifique o número digitado.
                </div>
              )}
            </div>

            {endereco && (
              <div className="address-fields">
                <div className="form-group-modern">
                  <label className="form-label">
                    <span className="label-icon">📍</span>
                    Rua
                  </label>
                  <input
                    type="text"
                    value={endereco.rua}
                    readOnly
                    className="form-input-modern readonly"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">🏘️</span>
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={endereco.bairro}
                      readOnly
                      className="form-input-modern readonly"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">🔢</span>
                      Número *
                    </label>
                    <input
                      type="text"
                      placeholder="Número"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="form-input-modern"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">🏙️</span>
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={endereco.cidade}
                      readOnly
                      className="form-input-modern readonly"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">🗺️</span>
                      Estado
                    </label>
                    <input
                      type="text"
                      value={endereco.estado}
                      readOnly
                      className="form-input-modern readonly"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-group-modern">
              <label className="form-label">
                <span className="label-icon">🏠</span>
                Complemento
              </label>
              <input
                type="text"
                placeholder="Ex: Casa 2, Bloco B, Apto 301..."
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="form-input-modern"
              />
              <span className="input-hint">Opcional</span>
            </div>
          </div>

          {frete && (
            <div className="shipping-result">
              <div className="shipping-success">
                <div className="success-icon">✅</div>
                <div className="shipping-info">
                  <span className="shipping-text">Frete calculado com sucesso!</span>
                  <span className="shipping-detail">Entrega em 3-5 dias úteis</span>
                </div>
              </div>
              
              <div className="shipping-values">
                <div className="value-item">
                  <span>Valor do frete:</span>
                  <span className="value">R$ {frete.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="order-summary-modern">
            <h4 className="summary-title">📦 Resumo do Pedido</h4>
            <div className="summary-values">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Frete:</span>
                <span>{frete ? `R$ ${frete.toFixed(2)}` : '--'}</span>
              </div>
              <div className="summary-line total">
                <span>Total:</span>
                <span className="total-value">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="address-modal-footer">
          <button 
            className="btn-cancel-modern"
            onClick={onCancel}
          >
            Voltar
          </button>
          
          <button 
            className={`btn-confirm-modern ${!numero || !frete ? 'disabled' : ''}`}
            onClick={finalizar}
            disabled={!numero || !frete}
          >
            <span className="btn-icon">💳</span>
            Finalizar Compra
            <span className="btn-total">R$ {total.toFixed(2)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddressModal;