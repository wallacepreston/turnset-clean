# A/B Test Analysis Guide

This guide explains how to analyze the results of your A/B tests.

## Metrics to Track

### Primary Metrics
1. **Click-Through Rate (CTR)**: Percentage of users who click the CTA button
   - Formula: `(Clicks / Views) × 100`
   - Example: If 1000 users see the button and 50 click it, CTR = 5%

2. **Conversion Rate**: Percentage of users who complete a goal (purchase, signup, etc.)
   - Formula: `(Conversions / Views) × 100`
   - Example: If 1000 users see the button and 20 make a purchase, Conversion Rate = 2%

### Secondary Metrics
- **Time to Click**: How quickly users interact with the variant
- **Bounce Rate**: Users who leave without interacting
- **Revenue per Visitor**: Total revenue / number of visitors

## How to Analyze Results

### 1. Using Google Analytics 4 (GA4)

If you've integrated GA4, you can analyze results in the GA4 dashboard:

1. Go to **Reports** → **Engagement** → **Events**
2. Filter for events starting with `ab_test_`
3. Compare metrics between variants:
   - `ab_test_click` events for each variant
   - `ab_test_conversion` events for each variant

**Custom Report Example:**
```
Event: ab_test_click
Dimensions: test_name, variant
Metrics: Event count, Users
```

### 2. Using Plausible Analytics

If using Plausible, events will appear in your dashboard:
- Go to **Dashboard** → **Custom Events**
- Filter by test name and variant
- Compare click rates and conversion rates

### 3. Using Custom Analytics API

If you're storing events in your database, you can query:

```sql
-- Click-through rate by variant
SELECT 
  variant,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
  ROUND(
    COUNT(CASE WHEN event_type = 'click' THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN event_type = 'view' THEN 1 END), 0) * 100, 
    2
  ) as ctr_percentage
FROM ab_test_events
WHERE test_name = 'hero-cta-test'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY variant;

-- Conversion rate by variant
SELECT 
  variant,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
  COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN event_type = 'view' THEN 1 END), 0) * 100, 
    2
  ) as conversion_rate_percentage
FROM ab_test_events
WHERE test_name = 'hero-cta-test'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY variant;
```

### 4. Statistical Significance

Before declaring a winner, ensure you have:
- **Minimum sample size**: At least 100-200 conversions per variant
- **Statistical significance**: Use a calculator like [this one](https://www.optimizely.com/sample-size-calculator/)
- **Confidence level**: Typically 95% confidence (p < 0.05)

**Example Calculation:**
- Control: 1000 views, 50 clicks (5% CTR)
- Variant A: 1000 views, 65 clicks (6.5% CTR)
- Is this significant? Use a statistical test (chi-square, t-test, etc.)

## Example Analysis Workflow

### Step 1: Collect Data
Run the test for at least 1-2 weeks to account for:
- Day-of-week effects
- Seasonal variations
- Different user segments

### Step 2: Calculate Metrics
```javascript
// Example calculation
const control = {
  views: 5000,
  clicks: 250,
  conversions: 50,
};

const variantA = {
  views: 5000,
  clicks: 325,
  conversions: 75,
};

const controlCTR = (control.clicks / control.views) * 100; // 5%
const variantACTR = (variantA.clicks / variantA.views) * 100; // 6.5%

const controlConversion = (control.conversions / control.views) * 100; // 1%
const variantAConversion = (variantA.conversions / variantA.views) * 100; // 1.5%
```

### Step 3: Statistical Testing
Use a tool like:
- [Optimizely Stats Engine](https://www.optimizely.com/statistics/)
- [AB Test Guide Calculator](https://abtestguide.com/calc/)
- R or Python for custom analysis

### Step 4: Make a Decision
- **If significant**: Implement the winning variant
- **If not significant**: Continue testing or try a different variation
- **If inconclusive**: Consider testing a different element

## Best Practices

1. **Test one thing at a time**: Don't test multiple elements simultaneously
2. **Run tests long enough**: Account for weekly patterns and seasonality
3. **Segment your data**: Analyze by device, traffic source, user type
4. **Document everything**: Keep notes on what you tested and why
5. **Follow up**: After implementing a winner, monitor for any negative impacts

## Tools & Resources

- **Statistical Calculators**:
  - [Optimizely Sample Size Calculator](https://www.optimizely.com/sample-size-calculator/)
  - [AB Test Guide](https://abtestguide.com/)
  
- **Analytics Platforms**:
  - Google Analytics 4
  - Plausible Analytics
  - Mixpanel
  - Amplitude

- **A/B Testing Platforms**:
  - Optimizely
  - VWO
  - Google Optimize (deprecated, but concepts apply)

