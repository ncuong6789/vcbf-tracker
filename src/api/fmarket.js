export const VCBF_FUNDS = [
  { id: 46, name: 'VCBF-MGF', shortName: 'MGF', fullName: 'Quỹ Đầu tư Cổ phiếu Tăng trưởng VCBF' },
  { id: 32, name: 'VCBF-BCF', shortName: 'BCF', fullName: 'Quỹ Đầu tư Cổ phiếu Hàng đầu VCBF' },
  { id: 31, name: 'VCBF-TBF', shortName: 'TBF', fullName: 'Quỹ Đầu tư Cân bằng Chiến lược VCBF' },
  { id: 33, name: 'VCBF-FIF', shortName: 'FIF', fullName: 'Quỹ Đầu tư Trái phiếu VCBF' },
  { id: 82, name: 'VCBF-AIF', shortName: 'AIF', fullName: 'Quỹ Đầu tư Thu nhập Chủ động VCBF' }
];

/**
 * Fetch detailed product data from Fmarket for a single fund.
 * This endpoint returns the most up-to-date nav, navToPrevious (change),
 * and portfolio holdings all in one call.
 */
async function fetchProductDetail(fundId) {
  const response = await fetch(`https://api.fmarket.vn/res/products/${fundId}`, {
    headers: { 'Accept': 'application/json, text/plain, */*' }
  });
  const data = await response.json();
  return data.data;
}

export async function fetchCurrentNavs() {
  try {
    const results = await Promise.all(VCBF_FUNDS.map(async (fund) => {
      try {
        const detail = await fetchProductDetail(fund.id);
        const navChange = detail.productNavChange || {};
        const nav = detail.nav;
        const navToPrevious = navChange.navToPrevious || 0; // percentage change
        // Convert percent to VND change
        const changeVnd = nav ? (nav * navToPrevious) / (100 + navToPrevious) : 0;

        return {
          ...fund,
          nav: nav,
          navDate: detail.updateAt ? new Date(detail.updateAt).toISOString().split('T')[0] : null,
          change: changeVnd,
          changePercent: navToPrevious,
          // Performance data
          navTo1Month: navChange.navTo1Months,
          navTo3Months: navChange.navTo3Months,
          navTo6Months: navChange.navTo6Months,
          navTo12Months: navChange.navTo12Months,
          navTo36Months: navChange.navTo36Months,
          navToEstablish: navChange.navToEstablish,
          // Holdings
          topHoldings: detail.productTopHoldingList || [],
          industryHoldings: detail.productIndustriesHoldingList || [],
          assetAllocation: detail.productAssetHoldingList || [],
          // Meta
          managementFee: detail.managementFee,
          totalAsset: detail.issueValue,
        };
      } catch (e) {
        console.error(`Error fetching detail for fund ${fund.id}:`, e);
        return fund;
      }
    }));
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
    return data.data ? data.data.sort((a, b) => a.navDate.localeCompare(b.navDate)) : [];
  } catch (e) {
    console.error("Error fetching history:", e);
    return [];
  }
}

/**
 * Fetch real-time gold price using Yahoo Finance API (GC=F = gold futures USD/oz)
 * and USD/VND conversion from exchangerate API
 */
export async function fetchGoldPrice() {
  try {
    // Fetch gold price (USD/oz) from Yahoo Finance
    const [goldRes, fxRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=1d', {
        headers: { 'Accept': 'application/json' }
      }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDVND%3DX?interval=1d&range=1d', {
        headers: { 'Accept': 'application/json' }
      })
    ]);

    const goldData = await goldRes.json();
    const fxData = await fxRes.json();

    const goldUsd = goldData?.chart?.result?.[0]?.meta?.regularMarketPrice;
    const usdVnd = fxData?.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (!goldUsd || !usdVnd) return null;

    const goldVndOz = goldUsd * usdVnd;
    const goldVndChi = goldVndOz / 26.67; // 1 troy oz ≈ 26.67 chi (1 chi = 3.75g, 1 oz = 31.1g)
    const goldVndLuong = goldVndChi * 10; // 1 luong = 10 chi
    
    const prevGoldUsd = goldData?.chart?.result?.[0]?.meta?.previousClose;
    const changeUsd = prevGoldUsd ? goldUsd - prevGoldUsd : 0;
    const changePercent = prevGoldUsd ? (changeUsd / prevGoldUsd) * 100 : 0;

    return {
      priceUsdOz: goldUsd,
      priceVndOz: goldVndOz,
      priceVndChi: goldVndChi,
      priceVndLuong: goldVndLuong,
      usdVnd: usdVnd,
      changeUsd: changeUsd,
      changePercent: changePercent,
    };
  } catch (e) {
    console.error("Error fetching gold price:", e);
    return null;
  }
}
