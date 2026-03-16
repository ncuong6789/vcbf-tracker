export const VCBF_FUNDS = [
  { id: 46, name: 'VCBF-MGF', shortName: 'MGF', fullName: 'Quỹ Đầu tư Cổ phiếu Tăng trưởng VCBF' },
  { id: 32, name: 'VCBF-BCF', shortName: 'BCF', fullName: 'Quỹ Đầu tư Cổ phiếu Hàng đầu VCBF' },
  { id: 31, name: 'VCBF-TBF', shortName: 'TBF', fullName: 'Quỹ Đầu tư Cân bằng Chiến lược VCBF' },
  { id: 33, name: 'VCBF-FIF', shortName: 'FIF', fullName: 'Quỹ Đầu tư Trái phiếu VCBF' },
  { id: 82, name: 'VCBF-AIF', shortName: 'AIF', fullName: 'Quỹ Đầu tư Thu nhập Chủ động VCBF' }
];

export async function fetchCurrentNavs() {
    try {
        const response = await fetch('https://api.fmarket.vn/res/products/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify({
                "types": ["NEW_FUND", "TRADING_FUND"],
                "status": 3,
                "isIpo": false,
                "sortOrder": "DESC",
                "sortField": "navTo6Months",
                "page": 1,
                "pageSize": 100
            })
        });
        const data = await response.json();
        
        // Match with our defined list to ensure order and presence
        const results = VCBF_FUNDS.map(fund => {
            const apiData = data.data.rows.find(f => f.id === fund.id);
            if (apiData) {
                return {
                    ...fund,
                    nav: apiData.nav,
                    navDate: apiData.navDate,
                    change: apiData.navToPrevious,
                    changePercent: apiData.navToPrevious / (apiData.nav - apiData.navToPrevious) * 100,
                    vnpayId: apiData.vnpayId,
                    totalAsset: apiData.totalAsset
                };
            }
            return fund;
        });
        
        return results;
    } catch (e) {
        console.error("Error fetching current navs:", e);
        return [];
    }
}

export async function fetchHistory(productId, fromDate, toDate) {
    try {
        const response = await fetch('https://api.fmarket.vn/res/product/get-nav-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify({
                "productId": productId,
                "searchField": "",
                "isAllData": 1,
                "fromDate": fromDate,
                "toDate": toDate
            })
        });
        const data = await response.json();
        return data.data ? data.data.reverse() : []; // Reverse to have older first for charts
    } catch (e) {
        console.error("Error fetching history:", e);
        return [];
    }
}
