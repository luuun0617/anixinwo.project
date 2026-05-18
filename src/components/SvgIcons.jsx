
import { pUrl } from '../utils/constants';

const SvgIcon = ({ 
  name, 
  prefix = 'icon', 
  color = 'currentColor', 
  width = '1em', 
  height = '1em', 
  className = '',
  isPublic = false 
}) => {

  if (isPublic) {

    const imgUrl = `${pUrl}ManagerImages/${name}.svg`;
        
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: width,
          height: height,
          backgroundColor: color, 
          WebkitMaskImage: `url(${imgUrl})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(${imgUrl})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />
    );
  }

  const symbolId = `#${prefix}-${name}`;
  return (
    <svg 
      width={width} 
      height={height} 
      className={className} 
      aria-hidden="true"
      style={{ fill: color, color: color }}
    >
      <use href={symbolId} />
    </svg>
  );
};

export default SvgIcon;