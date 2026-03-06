document.addEventListener('DOMContentLoaded', () => {

    // 1. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');

    // Check LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        // Apply default light theme
        htmlElement.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        // Re-render charts to match theme
        initCharts();
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
        }
    }

    // 2. Scroll Animations & Progress
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll Progress
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + '%';
    });

    // Intersection Observer for Reveal Animations
    // Intersection Observer for Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // 3. Finance Tools Tabs
    const toolTabs = document.querySelectorAll('.tool-tab');
    const toolPanels = document.querySelectorAll('.tool-panel');

    toolTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            toolTabs.forEach(t => t.classList.remove('active'));
            toolPanels.forEach(p => p.classList.remove('active'));

            // Add active class
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Helper: Format to Indian Rupees (₹)
    const formatINR = (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    // 4. SIP Calculator Logic
    const sipMonthlySlider = document.getElementById('sip-monthly');
    const sipRateSlider = document.getElementById('sip-rate');
    const sipYearsSlider = document.getElementById('sip-years');

    const sipMonthlyValDisplay = document.getElementById('sip-monthly-val');
    const sipRateValDisplay = document.getElementById('sip-rate-val');
    const sipYearsValDisplay = document.getElementById('sip-years-val');

    const sipResultDisplay = document.getElementById('sip-result');
    const sipInvestedDisplay = document.getElementById('sip-invested');
    const sipReturnsDisplay = document.getElementById('sip-returns');

    function calculateSIP() {
        const p = parseFloat(sipMonthlySlider.value);
        const r = parseFloat(sipRateSlider.value);
        const y = parseFloat(sipYearsSlider.value);

        sipMonthlyValDisplay.innerText = new Intl.NumberFormat('en-IN').format(p);
        sipRateValDisplay.innerText = r;
        sipYearsValDisplay.innerText = y;

        const months = y * 12;
        const i = r / 100 / 12;

        let futureValue = 0;
        let investedAmount = p * months;

        // SIP Formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
        if (i > 0) {
            futureValue = p * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
        } else {
            futureValue = investedAmount;
        }

        const estReturns = futureValue - investedAmount;

        sipResultDisplay.innerText = formatINR(futureValue);
        sipInvestedDisplay.innerText = formatINR(investedAmount);
        sipReturnsDisplay.innerText = formatINR(estReturns);
    }

    if (sipMonthlySlider) {
        [sipMonthlySlider, sipRateSlider, sipYearsSlider].forEach(slider => {
            slider.addEventListener('input', calculateSIP);
        });
        calculateSIP();
    }

    // 5. EMI Calculator Logic
    const loanAmountSlider = document.getElementById('loan-amount');
    const interestRateSlider = document.getElementById('interest-rate');
    const loanTenureSlider = document.getElementById('loan-tenure');

    const loanValDisplay = document.getElementById('loan-val');
    const rateValDisplay = document.getElementById('rate-val');
    const tenureValDisplay = document.getElementById('tenure-val');

    const emiResult = document.getElementById('emi-result');
    const totalInterestDisplay = document.getElementById('total-interest');
    const totalPaymentDisplay = document.getElementById('total-payment');

    function calculateEMI() {
        const p = parseFloat(loanAmountSlider.value);
        const r = parseFloat(interestRateSlider.value) / 12 / 100;
        const n = parseFloat(loanTenureSlider.value) * 12;

        loanValDisplay.innerText = new Intl.NumberFormat('en-IN').format(p);
        rateValDisplay.innerText = interestRateSlider.value;
        tenureValDisplay.innerText = loanTenureSlider.value;

        let emi = 0;
        let totalPaid = 0;
        let totalInterest = 0;

        if (r > 0) {
            emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            totalPaid = emi * n;
            totalInterest = totalPaid - p;
        } else {
            emi = p / n;
            totalPaid = p;
        }

        emiResult.innerText = formatINR(emi);
        totalInterestDisplay.innerText = formatINR(totalInterest);
        totalPaymentDisplay.innerText = formatINR(totalPaid);

        // Update EMI Chart if it exists
        if (window.emiChartInstance) {
            window.emiChartInstance.data.datasets[0].data = [p, totalInterest];
            window.emiChartInstance.update();
        }
    }

    [loanAmountSlider, interestRateSlider, loanTenureSlider].forEach(slider => {
        slider.addEventListener('input', calculateEMI);
    });

    const emiPresets = document.querySelectorAll('.emi-preset');
    emiPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            emiPresets.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.getAttribute('data-type');
            if (type === 'home') {
                loanAmountSlider.value = 5000000;
                interestRateSlider.value = 8.5;
                loanTenureSlider.value = 20;
            } else if (type === 'car') {
                loanAmountSlider.value = 800000;
                interestRateSlider.value = 9.0;
                loanTenureSlider.value = 5;
            } else if (type === 'personal') {
                loanAmountSlider.value = 500000;
                interestRateSlider.value = 12.0;
                loanTenureSlider.value = 3;
            }
            calculateEMI();
        });
    });

    calculateEMI(); // Initial call

    // 6. Income Tax Calculator (Basic Slab logic overlay)
    const taxBtn = document.getElementById('calc-tax-btn');
    if (taxBtn) {
        taxBtn.addEventListener('click', () => {
            const income = parseFloat(document.getElementById('tax-income').value);
            const deductions = parseFloat(document.getElementById('tax-deductions').value);

            if (isNaN(income) || income < 0) return;
            const validDeductions = isNaN(deductions) || deductions < 0 ? 0 : deductions;

            const taxableIncomeOld = Math.max(0, income - 50000 - validDeductions); // Old Regime includes deductions
            const taxableIncomeNew = Math.max(0, income - 75000); // New Regime Standard Deduction assumed

            // Dummy computation for demonstration (simplified India slabs 2024-2025)
            // Old Regime simplifies to roughly 20% flat post exemption
            let taxOld = 0;
            if (taxableIncomeOld > 500000) {
                taxOld = taxableIncomeOld * 0.15; // highly simplified average tax
            }

            // New Regime
            let taxNew = 0;
            if (taxableIncomeNew > 700000) {
                taxNew = taxableIncomeNew * 0.10; // highly simplified average tax
            }

            document.getElementById('tax-base').innerText = formatINR(income);
            document.getElementById('tax-new').innerText = formatINR(taxNew);
            document.getElementById('tax-old').innerText = formatINR(taxOld);
        });
    }

    // 7. Savings Goal Calculator
    const goalBtn = document.getElementById('calc-goal-btn');
    if (goalBtn) {
        goalBtn.addEventListener('click', () => {
            const target = parseFloat(document.getElementById('goal-target').value);
            const current = parseFloat(document.getElementById('goal-current').value);
            const pmt = parseFloat(document.getElementById('goal-monthly').value);

            if (isNaN(target) || isNaN(current) || isNaN(pmt) || pmt <= 0) return;

            const remaining = Math.max(0, target - current);
            if (remaining === 0) {
                document.getElementById('goal-result').innerText = "Goal Reached!";
                return;
            }

            const monthsNeeded = Math.ceil(remaining / pmt);
            const years = Math.floor(monthsNeeded / 12);
            const months = monthsNeeded % 12;

            let resultStr = "";
            if (years > 0) resultStr += `${years} Years `;
            if (months > 0) resultStr += `${months} Months`;

            document.getElementById('goal-result').innerText = resultStr.trim();
        });
    }

    // 7. Category Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const postCards = document.querySelectorAll('.post-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            postCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

    // 8. Initialize Chart.js
    let heroChartInstance = null;
    let expenseChartInstance = null;
    let sipChartInstance = null;

    function initCharts() {
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#EAECEB' : '#5C6B66';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        // Destroy existing
        if (heroChartInstance) heroChartInstance.destroy();
        if (expenseChartInstance) expenseChartInstance.destroy();
        if (sipChartInstance) sipChartInstance.destroy();

        // Common Chart Defaults
        Chart.defaults.color = textColor;
        Chart.defaults.font.family = "'Inter', sans-serif";

        // Number animation for Hero widget
        const animateValue = (obj, start, end, duration) => {
            if (!obj) return;
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                // easeOutQuart
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                const currentVal = Math.floor(easeProgress * (end - start) + start);
                obj.innerText = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentVal);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    obj.innerText = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(end);
                }
            };
            window.requestAnimationFrame(step);
        };

        const heroValObj = document.getElementById('hero-portfolio-value');
        if (heroValObj) {
            animateValue(heroValObj, 0, 10000000, 3000); // 1 Crore over 3 seconds
        }

        // A. Hero Line Chart
        const ctxHero = document.getElementById('heroChart');
        if (ctxHero) {
            heroChartInstance = new Chart(ctxHero, {
                type: 'line',
                data: {
                    labels: ['Year 1', 'Year 3', 'Year 5', 'Year 7', 'Year 9', 'Year 11', 'Year 12'],
                    datasets: [{
                        label: 'Portfolio Value',
                        data: [500000, 1500000, 2800000, 4800000, 7200000, 9100000, 10000000],
                        borderColor: '#2ECC71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#2ECC71',
                        pointRadius: 0, // hide points for smooth visual
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 3000,
                        easing: 'easeOutQuart'
                    },
                    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                    scales: {
                        x: { display: false, grid: { display: false } },
                        y: { display: false, grid: { display: false }, min: 0, max: 11000000 }
                    }
                }
            });
        }

        // B. Expense Pie Chart (Indian Context)
        const ctxExp = document.getElementById('expenseChart');
        if (ctxExp) {
            expenseChartInstance = new Chart(ctxExp, {
                type: 'doughnut',
                data: {
                    labels: ['Rent/EMI', 'Food & Groceries', 'Transport', 'Utilities', 'Savings & SIP'],
                    datasets: [{
                        data: [30, 25, 10, 15, 20],
                        backgroundColor: [
                            '#0F4C3A', '#FF9933', '#138808', '#3498DB', '#E74C3C'
                        ],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'right' },
                        tooltip: {
                            callbacks: { label: function (ctx) { return ctx.raw + '%'; } }
                        }
                    }
                }
            });
        }

        // C. SIP Growth Chart
        const ctxSip = document.getElementById('sipChart');
        if (ctxSip) {
            sipChartInstance = new Chart(ctxSip, {
                type: 'line',
                data: {
                    labels: ['Year 1', 'Year 3', 'Year 5', 'Year 7', 'Year 10'],
                    datasets: [
                        {
                            label: 'Amount Invested',
                            data: [60000, 180000, 300000, 420000, 600000],
                            borderColor: '#138808',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            borderDash: [5, 5]
                        },
                        {
                            label: 'Wealth Created',
                            data: [63412, 219000, 412000, 675000, 1161695],
                            borderColor: '#FF9933',
                            backgroundColor: 'rgba(255, 153, 51, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        x: { grid: { color: gridColor } },
                        y: {
                            grid: { color: gridColor },
                            ticks: { callback: function (val) { return '₹' + (val / 100000) + 'L'; } }
                        }
                    }
                }
            });
        }

        // D. EMI Pie Chart
        const ctxEmi = document.getElementById('emiChart');
        if (ctxEmi) {
            window.emiChartInstance = new Chart(ctxEmi, {
                type: 'doughnut',
                data: {
                    labels: ['Principal', 'Interest'],
                    datasets: [{
                        data: [5000000, 5418221],
                        backgroundColor: ['#138808', '#FF9933'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'bottom' }, tooltip: { mode: 'index', intersect: false } }
                }
            });
        }
    }

    // Trigger chart init if intersection observer is used, but for now just init
    setTimeout(initCharts, 100);

});
