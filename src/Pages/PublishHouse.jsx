import { Outlet, NavLink } from "react-router-dom";
import SvgIcon from '../../src/components/SvgIcons';
function PublishHouse() {
  return (
    <div className="container-fluid px-md-5 d-flex publish-layout mt-60">
      <aside className="sidebar">
        <ul className="p-0 m-0 d-flex publish-menu" style={{ listStyle: 'none' }}>
          <li className="flex-fill" style={{fontSize:"16px"}}>
            <NavLink 
              to="publishNewHouse" 
              className={({ isActive }) => `sidebar-link fw-semibold d-flex justify-center justify-md-start align-center py-16 py-md-20 mt-md-3 ${isActive ? 'text-system-accent border-bottom-light' : 'text-secondary'}`}
              style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              <i className='bi bi-house-add-fill me-8 me-md-3'></i>
              新增刊登屋件
            </NavLink>
          </li>
                
          <li className="flex-fill" style={{fontSize:"16px"}}>
            <NavLink 
              to="EditPublishHouses" 
              className={({ isActive }) => `sidebar-link d-flex fw-semibold justify-center justify-md-start align-center py-16 py-md-20 mt-md-3 ${isActive ? 'text-system-accent border-bottom-light' : 'text-secondary'}`}
              style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              <SvgIcon name='Icons-write' isPublic className="me-8 me-md-3"/>
              刊登屋件管理
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* 4. 右側內容區塊：手機版不需要左邊距 (把 ms-5 換成專屬設定) */}
      <div className="content content-area">
        <Outlet />
      </div>

    </div>
  );
}

export default PublishHouse;