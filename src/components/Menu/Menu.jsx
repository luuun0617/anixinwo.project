import { Link } from "react-router-dom";
import { useRef } from "react";
const Menu = () => {
  const closeBtnRef = useRef(null);

  const menuItems = [
    { id: 1, title: '屋件搜尋', path: '/search' },
    { id: 2, title: '最新屋件', path: '/under-construction' },
    { id: 3, title: '熱門租客評價', path: '/under-construction' },
    { id: 4, title: '主題找屋', path: '/under-construction' },
    { id: 5, title: '最新消息', path: '/under-construction' },
    { id: 6, title: 'Q&A', path: '/under-construction' },
  ];
  const handleLinkClick = () => {
    if (closeBtnRef.current) {
      closeBtnRef.current.click();
    }
  };
  return (
    <>
      <div 
        className="offcanvas offcanvas-end" 
        tabIndex="-1" 
        id="mobileMenu" 
        aria-labelledby="mobileMenuLabel"
      >
        <div className="offcanvas-header justify-content-between border-bottom px-4 py-3">
          <span className="fw-bold fs-5" style={{ color: "#6F5D42" }}>功能選單</span>
                    
          <div className="d-flex align-items-center gap-3">
            <button 
              ref = {closeBtnRef}
              type="button" 
              className="btn p-0 border-0" 
              data-bs-dismiss="offcanvas"
              aria-label="Close"
              style={{borderColor:"#D4AB6A"}}>
              <span style={{ fontSize: "28px", color: "#D4AB6A", lineHeight: "1" }}>
                &times;
              </span>
            </button>
          </div>
        </div>
        <div className="offcanvas-body d-flex flex-column align-items-center justify-content-start pt-5 gap-4">
          {menuItems.map((item) => (
            <Link
              to={item.path} 
              key={item.id}
              className="text-decoration-none fw-bold custom-list-button"
              onClick={handleLinkClick}
            >
              {item.title}
            </Link>
          ))}
        </div>
                
      </div>
    </>
  );
};

export default Menu;