import { Link } from "react-router-dom";
import SvgIcons from '../../../components/SvgIcons';
import { pUrl } from '../../../utils/constants'; 

function PropertyListItem({ property }) {
  if (!property) return null;

  const getImageUrl = (imgStr) => {
    if (!imgStr) return '';
    if (imgStr.startsWith('http')) {
      return imgStr;
    }
    return `${pUrl}${imgStr.replace(/^\//, '')}`;
  };

  return (
    <Link 
      to={`/item/${property.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <article className="property-card">
        <div className="property-card__image-wrap">
          <img
            src={getImageUrl(property.img)}
            alt={property.title}
            className="property-card__image"
          />
        </div>

        <div className="property-card__content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '12px',
            width: '100%'
          }}>
            <div className="property-card__info-left" style={{ flex: 1, paddingRight: '16px' }}> 
              <h3 className="property-card__title" style={{ marginTop: 0, marginBottom: '8px' }}>
                {property.title}
              </h3>
              <p className="property-card__address" style={{ margin: 0, color: '#666' }}>
                {property.address}
              </p>
            </div>
          </div>
          <ul className="property-card__meta">
            <li>
              <SvgIcons
                name='home-housesItem'
                color="#F5E0BD"
                width="24px"
                height="24px"
              />
              {property.layout?.room}房 {property.layout?.hall}廳 {property.layout?.bathroom}衛
            </li>
            <li>
              <SvgIcons
                name='home-location'
                color="#F5E0BD"
                width="24px"
                height="24px"
              />
              {property.size} 坪
            </li>
            
            <li>
              <SvgIcons
                name='home-have'
                color="#F5E0BD"
                width="24px"
                height="24px"
              />
              樓層：{property.floorInfo?.current} / {property.floorInfo?.total}F
            </li>
          </ul>
        </div>
        <div className="property-card__price">
          ${property.price?.toLocaleString()} / 月
        </div>
      </article>
    </Link>
  );
}

export default PropertyListItem;