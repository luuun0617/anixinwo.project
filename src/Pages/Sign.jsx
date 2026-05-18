import {  useState } from "react";
import SvgIcon from "../components/SvgIcons";
import Login from "../components/sign/Login";
import Signin from "../components/sign/Signin";


const Sign = () => {
  const [activeTab, setActiveTab] = useState('login');
  return (
        
    <div className="d-flex flex-column min-vh-100"> 
      <div className="container d-flex justify-content-center align-items-center flex-grow-1 my-5">
        <div className="card border-0 shadow-sm p-4 p-md-5" style={{ width: '100%', maxWidth: '500px', borderRadius: '20px' }}>
          <div className="text-center mb-5">
            <SvgIcon name='home-vector' color="#D4AB6A" width="64" height="54"/>
            <div className="mt-2">
              <span className="text-secondary fs-5">{activeTab==="signin"?"註冊安心窩":"登入安心窩"}</span>
            </div>
          </div>
          <div className="d-flex justify-content-around mb-5 border-bottom pb-3">
                        
            <div 
              className={`fs-4 cursor-pointer ${activeTab === 'login' ? 'text-dark fw-bold border-bottom border-warning border-4' : 'text-secondary'}`}
              onClick={() => setActiveTab('login')}
              style={{ marginBottom: '-16px' }}
            >
              登入
            </div>

            <div 
              className={`fs-4 cursor-pointer ${activeTab === 'signin' ? 'text-dark fw-bold border-bottom border-warning border-4' : 'text-secondary'}`}
              onClick={() => setActiveTab('signin')}
              style={{ marginBottom: '-16px' }}
            >
              註冊
            </div>
                        
                        
          </div>
          {
            activeTab==="login"?
              <Login/>:
              <Signin onSwitchToLogin={()=>setActiveTab("login")}/>
          }
                    
        </div>
      </div>
    </div>
  )
}

export default Sign;