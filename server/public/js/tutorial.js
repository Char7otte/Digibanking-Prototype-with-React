// ============================================================
// TUTORIAL ENGINE (Dashboard, Transfer, Profile)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    var tutorialBtn = document.getElementById('tutorial-btn');
    var overlay = document.getElementById('tutorial-overlay');
    var modal = document.getElementById('tutorial-modal');
    var highlight = document.getElementById('tutorial-highlight');
    var stepBox = document.getElementById('tutorial-step-box');

    if (!overlay || !modal || !highlight || !stepBox) {
        // Required containers not present – do nothing
        return;
    }

    function showOverlay() {
        overlay.classList.remove('hidden');
    }

    function hideOverlay() {
        overlay.classList.add('hidden');
    }

    function openModal() {
        showOverlay();
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    function endTutorial() {
        closeModal();
        hideOverlay();
        highlight.classList.add('hidden');
        stepBox.classList.add('hidden');
    }

    // Open tutorial menu
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', function () {
            openModal();
        });
    }

    // Close from "Close" button in modal
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('tutorial-close')) {
            endTutorial();
        }
    });

    // Clicking an option in the tutorial menu
    var optionButtons = document.querySelectorAll('.tutorial-option');
    optionButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var type = btn.getAttribute('data-tutorial');
            closeModal();
            startTutorial(type);
        });
    });

    // Highlight helper
    function highlightElement(el) {
        if (!el) return;

        var rect = el.getBoundingClientRect();
        var scrollX = window.scrollX || window.pageXOffset;
        var scrollY = window.scrollY || window.pageYOffset;

        highlight.style.width = (rect.width + 16) + 'px';
        highlight.style.height = (rect.height + 16) + 'px';
        highlight.style.left = (rect.left - 8 + scrollX) + 'px';
        highlight.style.top = (rect.top - 8 + scrollY) + 'px';
        highlight.classList.remove('hidden');

        stepBox.style.left = (rect.left + rect.width + 18 + scrollX) + 'px';
        stepBox.style.top = (rect.top + scrollY) + 'px';
        stepBox.classList.remove('hidden');
    }

    function runSteps(steps) {
        steps = steps.filter(function (s) { return s.element; });
        if (!steps.length) {
            endTutorial();
            return;
        }

        var index = 0;
        showOverlay();

        function showStep() {
            if (index >= steps.length) {
                endTutorial();
                return;
            }

            var step = steps[index];
            highlightElement(step.element);

            stepBox.innerHTML = ''
                + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
                + '  <strong>Step ' + (index + 1) + '</strong>'
                + '  <button type="button" id="tutorial-exit" '
                + '     style="border:none;background:none;font-size:16px;cursor:pointer;">✖</button>'
                + '</div>'
                + '<div>' + step.text + '</div>'
                + '<div style="margin-top:10px;text-align:right;">'
                + '  <button type="button" id="tutorial-next" '
                + '      class="button" '
                + '      style="padding:4px 10px;font-size:0.8rem;">Next</button>'
                + '</div>';

            var exitBtn = document.getElementById('tutorial-exit');
            if (exitBtn) {
                exitBtn.addEventListener('click', function () {
                    endTutorial();
                });
            }

            var nextBtn = document.getElementById('tutorial-next');
            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    index++;
                    showStep();
                });
            }
        }

        showStep();
    }

    // Detect current page
    function currentPath() {
        return window.location.pathname || '';
    }

    // ===== Tutorial flows per feature =====

    function startTutorial(type) {
        var path = currentPath();

        if (type === 'transfer') {
            if (path === '/dashboard') {
                // Guide from dashboard: quick action → nav transfer
                var steps = [
                    {
                        element: document.querySelector(".qa-item[href='/transfer']"),
                        text: 'This button is for sending money. Tap it to go to the transfer page.'
                    },
                    {
                        element: document.querySelector("a.nav-link[href='/transfer']"),
                        text: 'You can also reach the transfer page from here in the top menu.'
                    }
                ];
                runSteps(steps);
            } else if (path === '/transfer') {
                // On transfer page: explain tabs & fields
                var stepsT = [
                    {
                        element: document.querySelector(".transfer-tabs .tab[data-mode='local']"),
                        text: 'Here you choose <strong>Local Transfer</strong> to send money within the country.'
                    },
                    {
                        element: document.querySelector(".transfer-tabs .tab[data-mode='overseas']"),
                        text: 'Choose <strong>Overseas Transfer</strong> when sending money overseas.'
                    },
                    {
                        element: document.querySelector("select[name='from']"),
                        text: 'First, select which of your accounts you want to send money from.'
                    },
                    {
                        element: document.querySelector("input[name='recipient']"),
                        text: 'Then, type the <strong>recipient’s account number</strong> here.'
                    },
                    {
                        element: document.querySelector("input[name='amount']"),
                        text: 'Enter the <strong>amount</strong> of money you want to transfer.'
                    },
                    {
                        element: document.querySelector(".overseas-fields select[name='country']") || document.querySelector(".transfer-tabs .tab[data-mode='overseas']"),
                        text: 'For overseas transfers, choose the <strong>country</strong> and <strong>currency</strong> you want to send in.'
                    },
                    {
                        element: document.querySelector(".button.red"),
                        text: 'Finally, tap <strong>Transfer Now</strong> to send your money.'
                    }
                ];
                runSteps(stepsT);
            } else {
                // Other pages: just point to nav Transfer
                var stepsNav = [
                    {
                        element: document.querySelector("a.nav-link[href='/transfer']"),
                        text: 'Use this <strong>Transfer</strong> button to go to the transfer page.'
                    }
                ];
                runSteps(stepsNav);
            }
        }

        if (type === 'profile') {
            if (path === '/profile') {
                var stepsP = [
                    {
                        element: document.querySelector(".card.auth-card"),
                        text: 'Here you can see your profile details like name, username and account number.'
                    },
                    {
                        element: document.querySelector(".back-button"),
                        text: 'Tap this button to <strong>go back to your dashboard</strong>.'
                    }
                ];
                runSteps(stepsP);
            } else {
                var stepsP2 = [
                    {
                        element: document.querySelector("a.nav-link[href='/profile']"),
                        text: 'Tap here to open your <strong>profile page</strong>.'
                    }
                ];
                runSteps(stepsP2);
            }
        }

        if (type === 'paybills') {
            if (path === '/dashboard') {
                var stepsB = [
                    {
                        element: document.querySelector(".qa-item:nth-child(2)"),
                        text: 'This is the <strong>Pay Bills</strong> shortcut. Tap here to start paying your bills (for example utilities or phone).'
                    }
                ];
                runSteps(stepsB);
            } else {
                var stepsB2 = [
                    {
                        element: document.querySelector(".qa-item:nth-child(2)"),
                        text: 'On your dashboard you can use this <strong>Pay Bills</strong> button to pay your bills.'
                    }
                ];
                runSteps(stepsB2);
            }
        }
    }
});
