import { Link } from "react-router-dom";

const UnderConstruction = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <i className="bi bi-cone-striped text-warning mb-3" style={{ fontSize: '5rem' }}></i>
      <h2 className="fw-bold mb-3">此頁面建置中</h2>
      <p className="text-muted mb-4 text-center">
        工程師正努力開發這項新功能中，<br />
        請稍後再回來看看喔！
      </p>
      
      <Link to="/" className="btn btn-primary px-4 rounded-pill">
        回到首頁
      </Link>
    </div>
  );
};

export default UnderConstruction;