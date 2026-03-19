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
        // Use productNavChange.updateAt for actual NAV date (product updateAt is stale)
        const navDateRaw = navChange.updateAt ? new Date(navChange.updateAt) : new Date();
        const navDate = navDateRaw.toISOString().split('T')[0];

        return {
          ...fund,
          nav: nav,
          navDate: navDate,
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
 * Fetch real-time gold price using Yahoo Finance API via CORS proxy.
 * api.allorigins.win acts as a CORS proxy, wrapping the response as JSON.
 * GC=F = Gold Futures (COMEX, USD/oz)
 * USDVND=X = USD/VND exchange rate
 */
export async function fetchGoldPrice() {
  try {
    const proxyUrl = (url) => 
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    const [goldRes, fxRes] = await Promise.all([
      fetch(proxyUrl('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d')),
      fetch(proxyUrl('https://query1.finance.yahoo.com/v8/finance/chart/USDVND=X?interval=1d&range=1d'))
    ]);

    const goldWrapper = await goldRes.json();
    const fxWrapper = await fxRes.json();

    // allorigins wraps response in { contents: "..." }
    const goldData = JSON.parse(goldWrapper.contents);
    const fxData = JSON.parse(fxWrapper.contents);

    const goldMeta = goldData?.chart?.result?.[0]?.meta;
    const fxMeta = fxData?.chart?.result?.[0]?.meta;

    const goldUsd = goldMeta?.regularMarketPrice;
    const usdVnd = fxMeta?.regularMarketPrice;
    const prevGoldUsd = goldMeta?.previousClose;

    if (!goldUsd || !usdVnd) return null;

    const changeUsd = prevGoldUsd ? goldUsd - prevGoldUsd : 0;
    const changePercent = prevGoldUsd ? (changeUsd / prevGoldUsd) * 100 : 0;

    const goldVndOz = goldUsd * usdVnd;
    const goldVndChi = goldVndOz / 26.67; // 1 troy oz ≈ 26.67 chi (1 chi = 3.75g, 1 oz = 31.1035g)
    const goldVndLuong = goldVndChi * 10; // 1 luong = 10 chi

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
/**
 * Fetch historical data for all given funds and normalize it to calculate percentage growth 
 * over the selected time period. Useful for comparison charts.
 */
export async function fetchComparisonData(fundsList, fromDate, toDate) {
  try {
    const promises = fundsList.map(f => fetchHistory(f.id, fromDate, toDate));
    const results = await Promise.all(promises);
    
    // Group all history points by date
    const dateMap = {};
    
    fundsList.forEach((fund, index) => {
      const history = results[index] || [];
      // We need to calculate % growth from the first available point in this time range
      if (history.length === 0) return;
      
      const baseNav = history[0].nav; // oldest point since history is chronological
      
      history.forEach(point => {
        const date = point.navDate;
        if (!dateMap[date]) dateMap[date] = { date };
        
        // Calculate % growth: (nav - baseNav) / baseNav * 100
        const growth = ((point.nav - baseNav) / baseNav * 100);
        dateMap[date][fund.shortName] = growth;
      });

      // Inject today's live NAV to bridge the December 2025 gap
      if (fund.nav && fund.navDate) {
        const liveDate = fund.navDate;
        if (!dateMap[liveDate]) dateMap[liveDate] = { date: liveDate };
        
        const liveGrowth = ((fund.nav - baseNav) / baseNav * 100);
        dateMap[liveDate][fund.shortName] = liveGrowth;
      }
    });

    // Convert map to array and sort chronologically
    const sortedDates = Object.keys(dateMap).sort((a, b) => a.localeCompare(b));
    const finalData = sortedDates.map(d => dateMap[d]);
    
    return finalData;
  } catch (err) {
    console.error("Error fetching comparison data:", err);
    return [];
  }
}
