/**
 * Visual Layout Theme Definitions for the Road Database
 * Maps categorical attributes to specific HEX values for both Light and Dark conditions.
 */
export const themes = {
  // Theme 1: Spatial Functional Classification (Example attribute: 'highway')
  highway_type: {
    name: "Functional Class",
    attribute: "highway",
    categories: {
      'motorway':     { lightColor: '#D84315', darkColor: '#FF7043', label: 'Expressway' },
      'trunk':        { lightColor: '#E65100', darkColor: '#FFB74D', label: 'Arterial Spine' },
      'primary':      { lightColor: '#F57C00', darkColor: '#FFE082', label: 'Primary Road' },
      'secondary':    { lightColor: '#FBC02D', darkColor: '#FFF59D', label: 'Secondary Link' },
      'tertiary':     { lightColor: '#388E3C', darkColor: '#A5D6A7', label: 'Local Collector' },
      'residential':  { lightColor: '#1976D2', darkColor: '#90CAF9', label: 'Residential Grid' },
      'service':      { lightColor: '#78909C', darkColor: '#B0BEC5', label: 'Alleys / Service Access' },
      'pedestrian':   { lightColor: '#C2185B', darkColor: '#F48FB1', label: 'Historical Walking Lanes' }
    }
  },

  // Theme 2: Historical Epoch/Chronology (Example database attribute: 'period')
  historical_epoch: {
    name: "Thời kỳ Lịch sử",
    attribute: "period", // Matches column name inside hian_db.csv or hian_geninfo.csv
    categories: {
      'Hồng Bàng - sơ sử':         { lightColor: '#2b83ba', darkColor: '#2b83ba', label: 'Hồng Bàng - sơ sử (trước 258TCN)' },
      'Bắc Thuộc & khởi nghĩa':    { lightColor: '#5aa4b2', darkColor: '#5aa4b2', label: 'Bắc Thuộc & khởi nghĩa (258 TCN - 938 SCN)' },
      'Độc lập tự chủ sớm':        { lightColor: '#88c4aa', darkColor: '#88c4aa', label: 'Độc lập tự chủ sớm (938 - 1009)' },
      'Nhà Lý':                    { lightColor: '#b3e0a6', darkColor: '#b3e0a6', label: 'Nhà Lý (1009 - 1226)' },
      'Nhà Trần':                  { lightColor: '#d1ecb0', darkColor: '#d1ecb0', label: 'Nhà Trần (1226 - 1400)' },
      'Nhà Hồ & Minh thuộc':       { lightColor: '#f0f9ba', darkColor: '#f0f9ba', label: 'Nhà Hồ & Minh thuộc (1400 - 1428)' },
      'Nhà Hậu Lê':                    { lightColor: '#f0f9ba', darkColor: '#f0f9ba', label: 'Nhà Hậu Lê (1428 - 1527)' },
      'Phân tranh':                { lightColor: '#fed38c', darkColor: '#fed38c', label: 'Phân tranh (1527 - 1788)' },
      'Nhà Tây Sơn':               { lightColor: '#fdb56a', darkColor: '#fdb56a', label: 'Nhà Tây Sơn (1788 - 1802)' },
      'Nhà Nguyễn & Pháp thuộc':   { lightColor: '#fdb56a', darkColor: '#fdb56a', label: 'Nhà Nguyễn & Pháp thuộc (1802 - 1945)' },
      'Cách mạng & kháng chiến':   { lightColor: '#fdb56a', darkColor: '#fdb56a', label: 'Cách mạng & kháng chiến (1945 - 1975)' },
      'Sau Giải phóng & hiện đại': { lightColor: '#d7191c', darkColor: '#d7191c', label: 'Sau Giải phóng & hiện đại (1975 - nay)' }
      
    }
  }
};