
import PropertyListItem from './PropertyListItem';

function PropertyList({ properties }) {

  return (
    <div className="property-list">
      {properties.map(property => {
        return (
          <PropertyListItem 
            key={property.id} 
            property={{ ...property}} 
          />
        );
      })}
    </div>
  );
}

export default PropertyList;