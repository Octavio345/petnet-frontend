import { useState } from "react";

const FoodForm = () => {
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const raca = document.getElementById("raca").value;
    const idade = parseInt(document.getElementById("idade").value);

    let msg = "";

    if (raca === "labrador") msg = idade < 1 ? "Royal Canin Labrador Filhote" : "Premier Adulto";
    if (raca === "shih-tzu") msg = idade < 1 ? "Royal Canin Shih Tzu Filhote" : "Premier Pequenas";
    if (raca === "poodle") msg = idade < 1 ? "Royal Canin Poodle Filhote" : "Premier Poodle";
    if (raca === "vira-lata") msg = idade < 1 ? "Premium Filhote" : "Premium Adulto";

    setResult(msg);
  };

  return (
    <div className="card shadow-lg mt-4">
      <div className="card-body">
        <h3 className="card-title text-center mb-3">
          🍗 Melhor ração pro seu cão
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label">Raça</label>
              <select id="raca" className="form-select" required>
                <option value="">Selecione...</option>
                <option value="labrador">Labrador</option>
                <option value="shih-tzu">Shih Tzu</option>
                <option value="poodle">Poodle</option>
                <option value="vira-lata">SRD</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Idade</label>
              <input id="idade" type="number" className="form-control" min="0" max="30" required />
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-primary">Quero saber</button>
            </div>
          </div>
        </form>

        {result && (
          <div className="alert alert-info mt-4">
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodForm;
