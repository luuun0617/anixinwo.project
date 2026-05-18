const BasicDeta = ({ houseData }) => {
  const hasParking = houseData?.equipmentIds?.includes(2);

  const sizeItems = [
    { 
      label: "總坪數", 
      value: houseData?.size ? `${houseData.size} 坪` : "找不到資料" 
    },
    { 
      label: "主坪數", 
      value: houseData?.mainSize ? `${houseData.mainSize} 坪` : "找不到資料" 
    },
    { 
      label: "公共設施", 
      value: houseData?.publicSize ? `${houseData.publicSize} 坪` : "找不到資料" 
    },
    { 
      label: "土地坪數", 
      value: houseData?.landSize ? `${houseData.landSize} 坪` : "找不到資料" 
    },
    { 
      label: "車位", 
      value: hasParking ? "有" : "無" 
    },
  ];

  const otherItems = [
    {
      label: "管理費",
      value: houseData?.managerPrice > 0 
        ? `$${houseData.managerPrice.toLocaleString()} / 月` 
        : '無'
    },
    { 
      label: "法定用途", 
      value: houseData?.typeName || "找不到資料" 
    },
  ];

  return (
    <>
      <section className="mb-5">
        <h3 className="fs-5 fw-bold mb-4 ps-3 border-start border-4 border-primary">
          基本資料
        </h3>
        <div className="bg-white p-0 p-md-4 rounded-3 border border-light mt-3">
          <div className="row row-cols-2 row-cols-md-5 gy-3">
            {sizeItems.map((item, index) => (
              <div className="col" key={`size-${index}`}>
                <p className="text-secondary small mb-1">{item.label}</p>
                <p className="fw-normal mb-0">{item.value}</p>
              </div>
            ))}
          </div>
          <hr className="text-secondary opacity-25 my-4" />
          <div className="row row-cols-2 row-cols-md-5 gy-3 mb-4">
            {otherItems.map((item, index) => (
              <div className="col" key={`other-${index}`}>
                <p className="text-secondary small mb-1">{item.label}</p>
                <p className="fw-normal mb-0">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="fw-normal text-primary-500 mb-0" style={{ fontSize: '13px' }}>
            ＊上述各項面積合計係依地政機關登記簿 登載的面積總合(平方公尺)換算為坪所得。 
            (1平方公尺=0.3025坪，小數點第三位四捨五入後取二位)
          </p>
        </div>
      </section>
    </>
  );
};

export default BasicDeta;