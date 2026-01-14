import { useState } from 'react';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('payment');
  const [openQuestion, setOpenQuestion] = useState(1);

  const categories = [
    { id: 'payment', name: 'Payment', icon: 'card' },
    { id: 'delivery', name: 'Delivery', icon: 'bag' },
    { id: 'cancellation', name: 'Cancellation & Return', icon: 'refresh' },
    { id: 'orders', name: 'My Orders', icon: 'box' },
    { id: 'products', name: 'Product & Services', icon: 'gear' },
  ];

  const faqs = {
    payment: [
      {
        id: 1,
        question: 'When is payment taken for my order?',
        answer: 'Payment is taken during the checkout process when you pay for your order. The order number that appears on the confirmation screen indicates payment has been successfully processed.',
      },
      {
        id: 2,
        question: 'How do I pay for my order?',
        answer: 'You can pay for your order using various payment methods including credit/debit cards, PayPal, bank transfers, and other supported payment gateways. Select your preferred payment method during checkout.',
      },
      {
        id: 3,
        question: 'What should I do if I\'m having trouble placing an order?',
        answer: 'If you encounter any issues while placing an order, please check your internet connection, clear your browser cache, or try using a different browser. If the problem persists, contact our support team for assistance.',
      },
      {
        id: 4,
        question: 'Which license do I need for an end product that is only accessible to paying users?',
        answer: 'For end products that are only accessible to paying users, you will need an Extended License. This license allows you to use the product in commercial applications with restricted access.',
      },
      {
        id: 5,
        question: 'Does my subscription automatically renew?',
        answer: 'Yes, subscriptions are set to automatically renew at the end of each billing cycle. You can manage or cancel your subscription at any time from your account settings.',
      },
    ],
    delivery: [
      {
        id: 1,
        question: 'How long does delivery take?',
        answer: 'Delivery times vary depending on your location and the shipping method selected. Standard delivery typically takes 5-7 business days, while express delivery takes 1-3 business days.',
      },
      {
        id: 2,
        question: 'What are the shipping costs?',
        answer: 'Shipping costs are calculated based on your location, package weight, and selected shipping method. You can view the exact shipping cost during checkout before completing your order.',
      },
    ],
    cancellation: [
      {
        id: 1,
        question: 'Can I cancel my order?',
        answer: 'Yes, you can cancel your order within 24 hours of placing it. After this period, cancellation may not be possible if the order has already been processed.',
      },
      {
        id: 2,
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for most products. Items must be in their original condition with tags attached. Please contact our support team to initiate a return.',
      },
    ],
    orders: [
      {
        id: 1,
        question: 'How can I track my order?',
        answer: 'Once your order has been shipped, you will receive a tracking number via email. You can use this tracking number to monitor your order status on our website or the carrier\'s website.',
      },
      {
        id: 2,
        question: 'Can I modify my order after placing it?',
        answer: 'Order modifications are only possible within the first hour after placing your order. After this period, please contact our support team for assistance.',
      },
    ],
    products: [
      {
        id: 1,
        question: 'What products do you offer?',
        answer: 'We offer a wide range of products including software licenses, templates, themes, and digital services. Browse our catalog to see all available products.',
      },
      {
        id: 2,
        question: 'Do you provide product support?',
        answer: 'Yes, we provide comprehensive product support including documentation, tutorials, and direct support through our help center. Premium customers receive priority support.',
      },
    ],
  };

  const getCategoryIcon = (icon) => {
    switch (icon) {
      case 'card':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
            <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
          </svg>
        );
      case 'bag':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
          </svg>
        );
      case 'refresh':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        );
      case 'box':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
          </svg>
        );
      case 'gear':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64.892-3.433.902-5.096 0-.272.18-.592.249-.904.214a9.9 9.9 0 0 0-.412.004c-.74.02-1.435.22-2.023.435l-.23.055c-.367.088-.564.5-.302.806l.169.213c.233.294.307.704.215 1.095l-.073.268c-.16.513-.5 1.003-.968 1.39a12.71 12.71 0 0 0 2.582 1.75l-.218.465a.873.873 0 0 1-.485.41l-.344.07c-1.17.234-1.23 1.4-.018 1.685l.003.001c.272.165.576.246.872.246l.088-.001a9.09 9.09 0 0 0 1.593-.25l.313-.11c.94-.33 1.88-.715 2.682-1.15l.12-.054c.312-.15.406-.533.227-.838l-.197-.325a.873.873 0 0 1 .117-1.008l1.002-1.005.022-.02a9.746 9.746 0 0 0 1.343-2.336z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const toggleQuestion = (id) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  return (
    <div className="container-fluid py-4">
      {/* Help Search Area */}
      <div
        className="card shadow-sm border-0 mb-4 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          minHeight: '250px',
        }}
      >
        <div className="card-body d-flex flex-column align-items-center justify-content-center py-5 position-relative" style={{ zIndex: 2 }}>
          <h2 className="mb-4 fw-bold">Hello, how can we help?</h2>
          <div className="w-100" style={{ maxWidth: '600px' }}>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white border-0">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search a question..."
                style={{ fontSize: '1.1rem' }}
              />
            </div>
            <p className="text-center text-muted mt-3 mb-0">or choose a category to quickly find the help you need</p>
          </div>
          {/* Decorative circles */}
          <div
            className="position-absolute"
            style={{
              left: '-100px',
              top: '-50px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              border: '2px dashed rgba(33, 150, 243, 0.3)',
              zIndex: 1,
            }}
          />
          <div
            className="position-absolute"
            style={{
              right: '-50px',
              top: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9c27b0 0%, #2196f3 100%)',
              opacity: 0.2,
              zIndex: 1,
            }}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Left Sidebar - Categories */}
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-3 ${
                      activeCategory === category.id ? 'active bg-primary text-white' : ''
                    }`}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setOpenQuestion(faqs[category.id]?.[0]?.id || null);
                    }}
                    style={{
                      padding: '1rem 1.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span className={activeCategory === category.id ? 'text-white' : 'text-primary'}>
                      {getCategoryIcon(category.icon)}
                    </span>
                    <span className="fw-semibold">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="card shadow-sm mt-4 border-0" style={{ background: 'transparent' }}>
            <div className="card-body p-0 text-center">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Person illustration */}
                <rect x="60" y="120" width="80" height="60" rx="5" fill="#90caf9" />
                <circle cx="100" cy="80" r="30" fill="#ffeb3b" />
                <rect x="70" y="100" width="60" height="40" rx="5" fill="#2196f3" />
                <rect x="50" y="180" width="100" height="20" rx="10" fill="#9e9e9e" />
                <rect x="40" y="140" width="120" height="5" rx="2" fill="#757575" />
                <rect x="30" y="100" width="140" height="60" rx="5" fill="#e0e0e0" />
                <rect x="50" y="110" width="100" height="30" rx="3" fill="#9e9e9e" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content - FAQs */}
        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="text-primary">{getCategoryIcon(categories.find(c => c.id === activeCategory)?.icon || 'gear')}</span>
                <div>
                  <h4 className="mb-0 fw-bold">
                    {categories.find(c => c.id === activeCategory)?.name || 'FAQ'}
                  </h4>
                  <p className="text-muted mb-0 small">Get help with {categories.find(c => c.id === activeCategory)?.name.toLowerCase() || 'faq'}</p>
                </div>
              </div>

              <div className="accordion" id="faqAccordion">
                {faqs[activeCategory]?.map((faq) => (
                  <div key={faq.id} className="accordion-item border mb-2">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${openQuestion === faq.id ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleQuestion(faq.id)}
                        aria-expanded={openQuestion === faq.id}
                      >
                        <span className="flex-grow-1 text-start">{faq.question}</span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className={`ms-2 transition-transform ${openQuestion === faq.id ? 'rotate-180' : ''}`}
                          style={{ transition: 'transform 0.3s ease' }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                          />
                        </svg>
                      </button>
                    </h2>
                    {openQuestion === faq.id && (
                      <div className="accordion-collapse show">
                        <div className="accordion-body">
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="card shadow-sm mt-4 border-0" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
            <div className="card-body py-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-primary px-3 py-2">QUESTION?</span>
                <h5 className="mb-0 fw-bold">You still have a question?</h5>
              </div>
              <p className="text-muted mb-4">
                If you cannot find a question in our FAQ, you can always contact us. We will answer to you shortly!
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body d-flex align-items-center gap-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.65 12.5a.678.678 0 0 1-.58-.122L6.5 10.43a.678.678 0 0 1-.122-.58l.122-1.034a.678.678 0 0 0-.122-.58L4.654 6.328a.678.678 0 0 0-.58-.122l-1.034.122a.678.678 0 0 1-.58-.122z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="fw-bold">+ (810) 2548 2568</div>
                        <div className="text-muted small">We are always happy to help</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body d-flex align-items-center gap-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.501l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="fw-bold">help@help.com</div>
                        <div className="text-muted small">Best way to get a quick answer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
