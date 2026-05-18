import { Link } from "react-router-dom";

const SpecialCard = ({ visibleIds }) => {
  return (
    <div
      className={`flex-shrink-0 house-card-wrapper ${visibleIds.has('view-more') ? 'opacity-100' : 'opacity-50'}`}
      key="view-more-card"
      data-id="view-more" 
      style={{ transition: 'opacity 0.2s ease-in-out' }}
    >
      <Link
        to="/search"
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          height: '100%'
        }}
      >
        <div
          className="card h-100 custom-card d-flex flex-column justify-content-center align-items-center"
          style={{
            borderRadius: '16px',
            border: '2px dashed #9cb7c4', 
            backgroundColor: '#f8f9fa',  
            minHeight: '350px'
          }}
        >
          <i
            className="bi bi-arrow-right-circle-fill mb-3"
            style={{ fontSize: '3rem', color: '#D4A373' }}
          ></i>
          <h4 className="fw-bold text-secondary text-center">
            探索更多<br />熱門房屋
          </h4>
        </div>
      </Link>
    </div>
  );
};

export default SpecialCard;