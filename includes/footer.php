    </main>
  </div>
</div>
<?php if ($whatsapp): ?>
<a class="whatsapp-fab" target="_blank" rel="noopener" href="https://wa.me/<?= e(preg_replace('/[^0-9]/', '', $whatsapp)) ?>" aria-label="تواصل عبر واتساب">
  <?= icon('whatsapp') ?>
</a>
<?php endif; ?>
<script src="<?= BASE_URL ?>/assets/js/app.js"></script>
</body>
</html>
