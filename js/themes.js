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
      'Hồng Bàng - sơ sử':         { lightColor: '#2b83ba', darkColor: '#2b83ba', label: 'Pre-Colonial (Ancient)' },
      'Bắc thuộc & khởi nghĩa':    { lightColor: '#5aa4b2', darkColor: '#5aa4b2', label: 'French Colonial Era' },
      'Độc lập tự chủ sớm':        { lightColor: '#88c4aa', darkColor: '#88c4aa', label: 'Post-1954 Modern Grid' },
      'Nhà Lý':                    { lightColor: '#b3e0a6', darkColor: '#b3e0a6', label: 'Post-1954 Modern Grid' },
      'Nhà Trần':                  { lightColor: '#d1ecb0', darkColor: '#d1ecb0', label: 'Post-1954 Modern Grid' },
      'Nhà Hồ & Minh thuộc':       { lightColor: '#f0f9ba', darkColor: '#f0f9ba', label: 'Post-1954 Modern Grid' },
      'Hậu Lê':                    { lightColor: '#f0f9ba', darkColor: '#f0f9ba', label: 'Post-1954 Modern Grid' },
      'Phân tranh':                { lightColor: '#fed38c', darkColor: '#fed38c', label: 'Post-1954 Modern Grid' },
      'Nhà Tây Sơn':               { lightColor: '#fdb56a', darkColor: '#fdb56a', label: 'Post-1954 Modern Grid' },
      'Nhà Nguyễn & Pháp thuộc':   { lightColor: '#fdb56a', darkColor: '#fdb56a', label: 'Post-1954 Modern Grid' },
      'Cách mạng & kháng chiến':   { lightColor: '#fdb56a', darkColor: '#fdb56a', label: 'Post-1954 Modern Grid' },
      'Sau Giải phóng & hiện đại': { lightColor: '#d7191c', darkColor: '#d7191c', label: 'Recent Expansions' }
      
    }
  }
};