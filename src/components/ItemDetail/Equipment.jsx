
import SvgIcon from '../SvgIcons';

const black= "#000";
const gray = "#ABABAB";

const Equipment = ({ houseData }) => {
  const equipmentIds = houseData?.equipmentIds || [];
  const requirementIds = houseData?.requirementIds || [];

  const checkIsActive = (dataArray, targetId) => {
    if (!Array.isArray(dataArray)) return false; 
    return dataArray.some(id => String(id) === String(targetId));
  };

  const equipmentList = [
    { id: 1, label: '有電梯', iconName: 'elevatorIcon' },
    { id: 2, label: '有車位', iconName: 'parkingIcon' },
    { id: 3, label: '有冰箱', iconName: 'cupboardIcon' }, 
    { id: 4, label: '有桌椅', iconName: 'deskIcon' },
    { id: 5, label: '單人床', iconName: 'singlebedIcon' },
    { id: 6, label: '雙人床', iconName: 'BedIcon' },
    { id: 7, label: '有對外窗', iconName: 'windowIcon' },
    { id: 8, label: '有沙發', iconName: 'sofaIcon' },
    { id: 9, label: '有電視', iconName: 'TVIcon' },
    { id: 10, label: '有衣櫃', iconName: 'wardRobeIcon' },
    { id: 11, label: '有網路', iconName: 'wifiIcon' },
    { id: 12, label: '有洗衣機', iconName: 'washingMachineIcon' },
    { id: 13, label: '有烘衣機', iconName: 'dryingMachineIcon' },
    { id: 14, label: '有冷氣', iconName: 'airConditioner' },
    { id: 15, label: '有熱水器', iconName: 'waterHeaterIcon' },
  ].map(item => ({
    ...item,
    isActive: checkIsActive(equipmentIds, item.id)
  }));

  const requirementList = [
    { id: 16, label: '可開伙', iconName: 'cookingIcon' },
    { id: 17, label: '可養寵物', iconName: 'dogCarrierIcon' },
    { id: 18, label: '有管理費', iconName: 'securityCameraIcon' }, 
  ].map(item => ({
    ...item,
    isActive: checkIsActive(requirementIds, item.id)
  }));

  const renderIconItem = (item) => {
    return (
      <div key={item.id} className={`col ${!item.isActive ? 'opacity-50' : ''}`}>
        <div className="d-flex flex-column align-items-center gap-2">
          <SvgIcon 
            name={`itemDeta-${item.iconName}` }
            width="24px" 
            height="24px" 
            color={item.isActive ? black: gray} 
          />
          <span 
            className="small fw-normal" 
            style={{ 
              color: item.isActive ? black : gray,
              textDecoration: item.isActive ? 'none' : 'line-through'
            }}
          >
            {item.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="mb-5">
      <h3 className="fs-5 fw-bold mb-4 ps-3 border-start border-4 border-primary">
        設備與要求
      </h3>
      <div className="p-0 p-md-4 bg-white rounded-3 border border-light">
        <div className="row row-cols-3 row-cols-md-6 gy-4">
          {equipmentList.map(renderIconItem)}
        </div>
        <hr className="text-secondary opacity-25 my-4" />
        <div className="row row-cols-3 row-cols-md-6 gy-4">
          {requirementList.map(renderIconItem)}
        </div>
      </div>
    </section>
  );
}

export default Equipment;