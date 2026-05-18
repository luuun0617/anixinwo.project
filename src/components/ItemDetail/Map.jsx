const Map = ({houseData}) => {
  const address= houseData?.address || null

  const encodedAddress = encodeURIComponent(address);

  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className="mb-5">
      <h3 className="fs-5 fw-bold mb-4 ps-3 border-start border-4 border-primary">
        地圖索引
      </h3>
      <div className="w-100 rounded-3 overflow-hidden border border-light shadow-sm map-container">
        <iframe
          title="house-location-map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen       
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        ></iframe>
      </div>
    </section>
  );
}

export default Map;