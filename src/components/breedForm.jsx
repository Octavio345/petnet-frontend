import { useState } from "react";

const BreedForm = () => {
  const [formData, setFormData] = useState({
    moradia: "apartamento",
    atividade: "baixa",
    tamanho: "pequeno",
    pelos: "indiferente",
    experiencia: "iniciante",
    criancasAnimais: "nao",
    temperamentos: [],
    observacoes: "",
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleTemperamento = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, temperamentos: [...formData.temperamentos, value] });
    } else {
      setFormData({
        ...formData,
        temperamentos: formData.temperamentos.filter((t) => t !== value),
      });
    }
  };

  const handleSubmit = () => {
    const recomendacao = gerarRecomendacao(formData);
    setResultado(recomendacao);
  };

  const gerarRecomendacao = (dados) => {
    let racasRecomendadas = [];
    
    if (dados.tamanho === "pequeno") {
      racasRecomendadas.push("Poodle", "Shih Tzu", "Yorkshire");
    } else if (dados.tamanho === "medio") {
      racasRecomendadas.push("Beagle", "Bulldog", "Cocker Spaniel");
    } else {
      racasRecomendadas.push("Labrador", "Golden Retriever", "Pastor Alemão");
    }
    
    if (dados.atividade === "baixa") {
      racasRecomendadas = racasRecomendadas.filter(raca => 
        ["Shih Tzu", "Bulldog", "Poodle"].includes(raca)
      );
    } else if (dados.atividade === "alta") {
      racasRecomendadas = racasRecomendadas.filter(raca => 
        ["Labrador", "Golden Retriever", "Pastor Alemão"].includes(raca)
      );
    }

    return {
      racas: racasRecomendadas.slice(0, 3),
      dadosUsuario: dados
    };
  };

  return (
    <div className="card shadow-lg">
      <div className="card-body">
        <h3 className="card-title mb-3 text-center">
          🐶 Qual raça combina com você?
        </h3>
        <p className="text-muted text-center">
          Responda algumas perguntas para descobrir!
        </p>

        <div className="row g-4">
          <div className="col-md-6">
            <label className="form-label">Onde você mora?</label>
            <select id="moradia" className="form-select" value={formData.moradia} onChange={handleChange}>
              <option value="apartamento">Apartamento</option>
              <option value="casa_sem_quintal">Casa sem quintal</option>
              <option value="casa_com_quintal">Casa com quintal</option>
              <option value="fazenda">Fazenda</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Seu nível de atividade</label>
            <select id="atividade" className="form-select" value={formData.atividade} onChange={handleChange}>
              <option value="baixa">Baixo</option>
              <option value="moderada">Moderado</option>
              <option value="alta">Alto</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Tamanho preferido</label>
            <select id="tamanho" className="form-select" value={formData.tamanho} onChange={handleChange}>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Queda de pelos</label>
            <select id="pelos" className="form-select" value={formData.pelos} onChange={handleChange}>
              <option value="indiferente">Não me importo</option>
              <option value="poucos_pelos">Prefiro poucos pelos</option>
              <option value="muito_importante">É muito importante</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Sua experiência com cães</label>
            <select id="experiencia" className="form-select" value={formData.experiencia} onChange={handleChange}>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="experiente">Experiente</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Tem crianças ou outros animais?</label>
            <select id="criancasAnimais" className="form-select" value={formData.criancasAnimais} onChange={handleChange}>
              <option value="nao">Não</option>
              <option value="criancas">Crianças</option>
              <option value="outros_animais">Outros animais</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Temperamento preferido</label>
            <div className="d-flex gap-3 flex-wrap">
              {[
                {valor: "amigavel", label: "Amigável"},
                {valor: "protetor", label: "Protetor"},
                {valor: "independente", label: "Independente"},
                {valor: "brincalhao", label: "Brincalhão"}
              ].map((t) => (
                <div className="form-check" key={t.valor}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={t.valor}
                    checked={formData.temperamentos.includes(t.valor)}
                    onChange={handleTemperamento}
                  />
                  <label className="form-check-label">{t.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12">
            <label className="form-label">Observações</label>
            <textarea
              id="observacoes"
              className="form-control"
              rows="2"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Alguma preferência específica?"
            />
          </div>

          <div className="col-12 text-end">
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              Descobrir Minha Raça
            </button>
          </div>
        </div>

        {resultado && (
          <div className="alert alert-success mt-4">
            <h5>🎯 Raças Recomendadas para Você:</h5>
            <ul className="mt-3">
              {resultado.racas.map((raca, index) => (
                <li key={index} className="h5">
                  <strong>{raca}</strong>
                </li>
              ))}
            </ul>
            <p className="mt-3 mb-0">
              <small>Baseado nas suas preferências: {formData.tamanho}, {formData.atividade} atividade, {formData.moradia.replace('_', ' ')}</small>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreedForm;