export function buildPopupHTML(props, options = {}) {
  // Map internal technical CSV headers to beautiful localized Vietnamese presentation headers
  const labels = {
    street_name: "Tên đường/ phố",
    old_names: "Tên cũ",
    category: "Phân loại chính",
    subcategory: "Phân loại con",
    description: "Mô tả",
    profession: "Nghề nghiệp chính",
    period: "Thời kỳ",
    title: "Chức vụ / Danh hiệu",
    equititle: "Danh hiệu tương đương",
    family: "Mối quan hệ gia đình",
    ke: "Kẻ",
    othernames: "Tên gọi khác",
    trivia: "Thông tin thú vị"
  };

  const whitelist = options.only || null;

  // If this is for the small popup box over the street
  if (!options.isPanel) {
    const fieldsToDisplay = whitelist || ["street_name", "subcategory"];
    return fieldsToDisplay
      .filter(k => props[k] && props[k] !== 'NULL' && props[k] !== '')
      .map(k => `<b>${labels[k] || k}:</b> ${props[k]}`)
      .join('<br>');
  }

  // If this is generating markup for the large sidebar Info Panel (#infoPanel)
  let html = `
    <div class="panel-header">
      <h3>${props.street_name || 'Không rõ tên đường'}</h3>
    </div>
    <div class="panel-body">
  `;

  // Define an elegant reading order for the historical database rows
  const detailedOrder = [
    "old_names", "othernames", "category", "subcategory", "period", "ke",
    "title", "equititle", "profession", "family", "description", "custom", "trivia"
  ];

  detailedOrder.forEach(k => {
    if (whitelist && !whitelist.includes(k)) return;
    
    const value = props[k];
    if (value && value !== 'NULL' && value !== '') {
      // Highlight trivia or description fields with a distinct class block style
      if (k === 'trivia' || k === 'description') {
        html += `
          <div class="panel-section block-section">
            <span class="section-label">${labels[k] || k}</span>
            <p class="section-value">${value}</p>
          </div>
        `;
      } else {
        html += `
          <div class="panel-section text-section">
            <span class="section-label">${labels[k] || k}:</span>
            <span class="section-value">${value}</span>
          </div>
        `;
      }
    }
  });

  html += `</div>`;
  return html;
}