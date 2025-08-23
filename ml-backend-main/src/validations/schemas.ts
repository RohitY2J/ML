import * as yup from 'yup';

// Common schemas
const timeframeSchema = yup.number().integer().min(1).max(100).default(90);

const symbolSchema = yup.string()
  .required('Symbol is required')
  .min(1, 'Symbol must not be empty');

// Stock schemas
export const stockListSchema = yup.object({
  query: yup.object({
    page: yup.number().integer().min(1).default(1),
    limit: yup.number().integer().min(1).max(100).default(10),
    search: yup.string(),
    sortBy: yup.string().oneOf(['symbol', 'name', 'sector', 'createdAt']).default('symbol'),
    sortOrder: yup.string().oneOf(['asc', 'desc']).default('asc')
  })
});

export const stockDetailSchema = yup.object({
  params: yup.object({
    symbol: symbolSchema
  })
});

// Trendline schemas
export const trendlineSchema = yup.object({
  query: yup.object({
    timeframe: timeframeSchema
  })
});

// Trading Zone schemas
export const tradingZoneSchema = yup.object({
  query: yup.object({
    timeframe: timeframeSchema
  })
});

// Trading Signal schemas
export const tradingSignalSchema = yup.object({
  query: yup.object({
    symbol: yup.string(),
    timeframe: yup.string(),
    type: yup.string().oneOf(['buy', 'sell', 'hold']),
    startDate: yup.date(),
    endDate: yup.date()
  })
});

// AI Signal schemas
export const aiSignalSchema = yup.object({
  query: yup.object({
    symbol: yup.string(),
    timeframe: yup.string(),
    type: yup.string().oneOf(['buy', 'sell', 'hold']),
    startDate: yup.date(),
    endDate: yup.date()
  })
});

export const technicalAnalysisSchema = yup.object({
    query: yup.object({
        symbol: yup.string().required('Symbol is required')
    })
}); 