document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('sidebarToggle');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebarBackdrop');
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('open');
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  var userBtn = document.getElementById('userMenuBtn');
  var userDropdown = document.getElementById('userDropdown');
  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function () {
      userDropdown.classList.remove('open');
    });
  }

  // Auto-dismiss alerts
  document.querySelectorAll('.alert').forEach(function (el) {
    setTimeout(function () { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; }, 5000);
  });

  // Service price calculator on the order form
  var serviceSelect = document.getElementById('service_id');
  var qtyInput = document.getElementById('quantity');
  var priceOut = document.getElementById('priceEstimate');
  var minMaxHint = document.getElementById('minMaxHint');
  var descOut = document.getElementById('serviceDescription');
  function recalc() {
    if (!serviceSelect || !qtyInput || !priceOut) return;
    var opt = serviceSelect.options[serviceSelect.selectedIndex];
    if (!opt || !opt.value) { priceOut.textContent = '0.00'; return; }
    var rate = parseFloat(opt.getAttribute('data-rate') || '0');
    var qty = parseInt(qtyInput.value || '0', 10);
    var min = opt.getAttribute('data-min');
    var max = opt.getAttribute('data-max');
    if (minMaxHint) minMaxHint.textContent = 'الحد الأدنى: ' + min + ' — الحد الأقصى: ' + max;
    if (descOut) descOut.textContent = opt.getAttribute('data-desc') || '';
    qtyInput.min = min;
    qtyInput.max = max;
    var total = (rate / 1000) * qty;
    priceOut.textContent = isNaN(total) ? '0.00' : total.toFixed(2);
  }
  if (serviceSelect) serviceSelect.addEventListener('change', recalc);
  if (qtyInput) qtyInput.addEventListener('input', recalc);
  recalc();

  // Simple client-side confirm for destructive actions
  document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('submit', function (e) {
      if (!confirm(el.getAttribute('data-confirm'))) e.preventDefault();
    });
    el.addEventListener('click', function (e) {
      if (el.tagName === 'A' && !confirm(el.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  // Copy-to-clipboard buttons
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.querySelector(btn.getAttribute('data-copy'));
      if (!target) return;
      var text = target.value !== undefined ? target.value : target.textContent;
      navigator.clipboard.writeText(text).then(function () {
        var original = btn.textContent;
        btn.textContent = 'تم النسخ!';
        setTimeout(function () { btn.textContent = original; }, 1500);
      });
    });
  });
});
