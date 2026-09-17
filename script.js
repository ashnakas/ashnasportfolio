(() => {
  // Live "available now" clock in the nav status chip.
  const localTime = document.querySelector('#localTime');
  if (localTime) {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
    const tick = () => { localTime.textContent = formatter.format(new Date()); };
    tick();
    setInterval(tick, 30000);
  }

  // Scroll-triggered reveals. The "reveal" class (which starts elements at opacity 0)
  // is applied here rather than in HTML, so it only ever affects users whose JS runs.
  const revealTargets = document.querySelectorAll(
    '.section-heading, .showcase-grid > a, .proof-list article, .case-intro, .evidence-layout, .image-pair, .decision-row > div, .seat-study, .simulation, .about figure, .about > div, footer h2, footer .contact'
  );
  if (revealTargets.length && 'IntersectionObserver' in window) {
    revealTargets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => io.observe(el));
  }

  const perspective = document.querySelector('.perspective');
  const copy = document.querySelector('#perspective-copy');
  const link = document.querySelector('#perspective-link');
  document.querySelectorAll('input[name="perspective"]').forEach(input => {
    input.addEventListener('change', () => {
      const agent = input.value === 'agent';
      perspective.dataset.perspective = input.value;
      copy.textContent = agent
        ? '{ designer: "Ashna", focus: ["AI", "UX", "development"] }'
        : 'Four projects. The problem, the move, and the proof.';
      link.href = agent ? 'portfolio.json' : '#recart';
      link.textContent = agent ? 'Read structured profile ↗' : 'Start with ReCart ↗';
    });
  });

  // Sample inventory for the portfolio study; no live marketplace connection.
  const products = [
    { name: 'Everyday denim jacket', category: 'outerwear', price: 38, condition: 'Very good', source: 'Marketplace A', color: '#dbe4ef' },
    { name: 'Cotton stripe shirt', category: 'shirts', price: 24, condition: 'Good', source: 'Marketplace B', color: '#f3e1db' },
    { name: 'Soft wool cardigan', category: 'knitwear', price: 46, condition: 'Very good', source: 'Marketplace C', color: '#e7e4f1' },
    { name: 'Lightweight field jacket', category: 'outerwear', price: 62, condition: 'Like new', source: 'Marketplace B', color: '#e3e9d7' },
    { name: 'Linen button-down', category: 'shirts', price: 32, condition: 'Very good', source: 'Marketplace C', color: '#f0ecd8' },
    { name: 'Cable knit sweater', category: 'knitwear', price: 55, condition: 'Like new', source: 'Marketplace A', color: '#e4e9e6' },
  ];
  const search = document.querySelector('#product-search');
  const category = document.querySelector('#category');
  const price = document.querySelector('#price');
  const sort = document.querySelector('#sort');
  const results = document.querySelector('#product-results');
  const count = document.querySelector('#result-count');
  function render() {
    const query = search.value.trim().toLowerCase();
    const filtered = products.filter(product =>
      (category.value === 'all' || product.category === category.value) &&
      product.price <= Number(price.value) &&
      `${product.name} ${product.category}`.toLowerCase().includes(query)
    );
    if (sort.value === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort.value === 'high') filtered.sort((a, b) => b.price - a.price);
    document.querySelector('#price-output').textContent = `$${price.value}`;
    count.textContent = `${filtered.length} sample listing${filtered.length === 1 ? '' : 's'}`;
    results.replaceChildren();
    filtered.forEach(product => {
      const item = document.createElement('article');
      item.className = 'product-item';
      const art = document.createElement('div');
      art.className = 'product-art';
      art.style.setProperty('--fabric', product.color);
      const icon = document.createElement('img');
      icon.src = 'assets/shirt.svg';
      icon.alt = '';
      icon.width = 68;
      icon.height = 68;
      const condition = document.createElement('span');
      condition.textContent = product.condition;
      art.append(icon, condition);
      const title = document.createElement('h4');
      title.className = 'product-name';
      const name = document.createElement('span');
      name.textContent = product.name;
      const amount = document.createElement('span');
      amount.textContent = `$${product.price}`;
      title.append(name, amount);
      const source = document.createElement('p');
      source.textContent = product.source;
      item.append(art, title, source);
      results.append(item);
    });
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const title = document.createElement('h4');
      title.textContent = 'No matches this time.';
      const hint = document.createElement('p');
      hint.textContent = 'Try another search or reset your filters.';
      empty.append(title, hint);
      results.append(empty);
    }
  }
  [search, category, price, sort].forEach(control => control.addEventListener('input', render));
  document.querySelector('#reset-filters').addEventListener('click', () => {
    search.value = '';
    category.value = 'all';
    price.value = '100';
    sort.value = 'recommended';
    render();
  });
  render();

  const seatMap = document.querySelector('.seat-map');
  const priority = document.querySelector('#seat-priority');
  const budget = document.querySelector('#seat-budget');
  const choice = document.querySelector('#seat-choice');
  const amount = document.querySelector('#seat-price');
  const reason = document.querySelector('#seat-reason');
  const kind = document.querySelector('#seat-kind');
  const seats = Array.from({ length: 56 }, (_, index) => {
    const row = Math.floor(index / 8);
    const column = index % 8;
    return {
      id: index,
      name: `Row ${String.fromCharCode(65 + row)}, seat ${column + 1}`,
      distance: Math.abs(column - 3.5) + Math.abs(row - 4) * 1.3,
      price: 12 + (row >= 2 && row <= 5 ? 5 : 0) + (column >= 2 && column <= 5 ? 6 : 0),
      available: index % 7 !== 0 && index % 11 !== 0,
    };
  });
  function selectSeat(seat, manual = false) {
    kind.textContent = manual ? 'Your selection' : 'Suggestion';
    choice.textContent = seat ? seat.name : 'No seats within budget';
    amount.textContent = seat ? `$${seat.price}` : '—';
    reason.textContent = !seat ? 'Increase your budget to see available options.'
      : manual ? `${seat.price <= Number(budget.value) ? 'Within' : 'Above'} your $${budget.value} budget. ${seat.distance <= 3 ? 'Close to the central sightline.' : 'Away from the central sightline.'}`
      : priority.value === 'budget' ? 'The lowest available price within your budget.'
      : priority.value === 'center' ? 'The closest available seat to the ideal central view within budget.'
      : 'Balances a central view with price, within your budget.';
    seats.forEach(item => item.button.setAttribute('aria-pressed', String(item.id === seat?.id)));
  }
  function recommend() {
    const options = seats.filter(seat => seat.available && seat.price <= Number(budget.value));
    const score = seat => priority.value === 'budget' ? seat.price * 100 + seat.distance
      : priority.value === 'center' ? seat.distance * 100 + seat.price
      : seat.distance * 2 + seat.price * .3;
    options.sort((a, b) => score(a) - score(b));
    selectSeat(options[0]);
  }
  seats.forEach(seat => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'seat';
    button.disabled = !seat.available;
    button.setAttribute('aria-label', `${seat.name}, $${seat.price}${seat.available ? '' : ', unavailable'}`);
    button.setAttribute('aria-pressed', 'false');
    button.title = `${seat.name} · $${seat.price}${seat.available ? '' : ' · unavailable'}`;
    button.addEventListener('click', () => selectSeat(seat, true));
    seat.button = button;
    seatMap.append(button);
  });
  priority.addEventListener('input', recommend);
  budget.addEventListener('input', recommend);
  recommend();
})();
