import { useState } from 'react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('annually');

  const plans = [
    {
      id: 'starter',
      name: 'STARTER',
      monthlyPrice: 49,
      annualPrice: 588,
      description: 'All the basics for business that are just getting started.',
      features: {
        included: [
          'Up to 10 users',
          '150+ components',
          'Basic support on Github',
        ],
        excluded: [
          'Monthly updates',
          'Integrations',
          'Full Support',
        ],
      },
      popular: false,
    },
    {
      id: 'pro',
      name: 'PRO / 15% OFF',
      monthlyPrice: 99,
      annualPrice: 1188,
      description: 'Batter for growing business that want to more customers',
      features: {
        included: [
          'Up to 10 users',
          '150+ components',
          'Basic support on Github',
          'Monthly updates',
        ],
        excluded: [
          'Integrations',
          'Full Support',
        ],
      },
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'ENTERPRISE',
      monthlyPrice: 149,
      annualPrice: 1788,
      description: 'Advance features for enterprise who need more customization.',
      features: {
        included: [
          'Up to 10 users',
          '150+ components',
          'Basic support on Github',
          'Monthly updates',
          'Integrations',
          'Full Support',
        ],
        excluded: [],
      },
      popular: false,
    },
  ];

  const calculateMonthlyPrice = (plan) => {
    if (billingCycle === 'annually') {
      return Math.round(plan.annualPrice / 12);
    }
    return plan.monthlyPrice;
  };

  const calculateAnnualPrice = (plan) => {
    return plan.annualPrice;
  };

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Find the right plan for your site.</h1>
        <p className="text-muted fs-5 mb-4">
          Get started with us - it's perfect for individuals and teams. Choose a subscription plan that meets your needs.
        </p>

        {/* Billing Toggle */}
        <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
          <span className={billingCycle === 'monthly' ? 'fw-bold' : 'text-muted'}>Monthly</span>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="billingToggle"
              checked={billingCycle === 'annually'}
              onChange={(e) => setBillingCycle(e.target.checked ? 'annually' : 'monthly')}
              style={{ width: '3rem', height: '1.5rem' }}
            />
          </div>
          <span className={billingCycle === 'annually' ? 'fw-bold' : 'text-muted'}>Annually</span>
          {billingCycle === 'annually' && (
            <span className="badge bg-primary px-3 py-2 d-flex align-items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
              GET 2 MONTHS FREE
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="row g-4 justify-content-center">
        {plans.map((plan) => (
          <div key={plan.id} className="col-md-4">
            <div
              className={`card shadow-sm h-100 position-relative ${
                plan.popular ? 'border-primary border-2' : ''
              }`}
              style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {plan.popular && (
                <span
                  className="badge bg-primary position-absolute top-0 end-0 m-3 px-3 py-2"
                  style={{ fontSize: '0.75rem' }}
                >
                  POPULAR
                </span>
              )}
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-3">{plan.name}</h5>
                <div className="mb-3">
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="display-4 fw-bold text-primary">
                      ${calculateMonthlyPrice(plan)}
                    </span>
                    <span className="text-muted">/mo</span>
                  </div>
                  {billingCycle === 'annually' && (
                    <div className="text-muted small mt-1">
                      $ {calculateAnnualPrice(plan).toLocaleString()} / year
                    </div>
                  )}
                </div>
                <p className="text-muted mb-4">{plan.description}</p>

                <div className="mb-4">
                  {/* Included Features */}
                  {plan.features.included.map((feature, index) => (
                    <div key={`included-${index}`} className="d-flex align-items-start gap-2 mb-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="text-primary mt-1 flex-shrink-0"
                      >
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                      </svg>
                      <span className="small">{feature}</span>
                    </div>
                  ))}

                  {/* Excluded Features */}
                  {plan.features.excluded.map((feature, index) => (
                    <div key={`excluded-${index}`} className="d-flex align-items-start gap-2 mb-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="text-muted mt-1 flex-shrink-0"
                        style={{ opacity: 0.5 }}
                      >
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                      <span className="small text-muted text-decoration-line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`btn w-100 ${
                    plan.popular ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
