// Fonction pour sauvegarder l'état
function saveStateToCookie() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const textInputs = document.querySelectorAll('#otherSins input[type="text"]');
    const state = {
        checkboxes: {},
        customSins: []
    };

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            state.checkboxes[index] = {
                checked: checkbox.checked,
                value: checkbox.value
            };
        }
    });

    if (textInputs.length > 0) {
        textInputs.forEach(input => {
            if (input.value.trim() !== "") {
                state.customSins.push(input.value);
            }
        });
    }

    try {
        localStorage.setItem('confessionState', JSON.stringify(state));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
    }
}

// Fonction pour restaurer l'état
function restoreStateFromCookie() {
    try {
        const stateStr = localStorage.getItem('confessionState');
        console.log('État stocké:', stateStr);

        if (stateStr) {
            const state = JSON.parse(stateStr);
            console.log('État parsé:', state);

            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            Object.entries(state.checkboxes).forEach(([index, data]) => {
                if (checkboxes[index]) {
                    if (checkboxes[index].value === data.value) {
                        checkboxes[index].checked = data.checked;
                    }
                }
            });

            // Restaurer les péchés personnalisés
            const otherSins = document.getElementById('otherSins');
            if (otherSins && state.customSins && state.customSins.length > 0) {
                otherSins.innerHTML = ''; // Nettoyer la section

                state.customSins.forEach(sin => {
                    const newDiv = document.createElement('div');
                    newDiv.innerHTML = `
                        <input type="checkbox" name="peche" checked value="${sin}">
                        <input type="text" placeholder="Entrez votre péché" value="${sin}" oninput="addCheckbox(this)">
                    `;
                    otherSins.appendChild(newDiv);
                });

                // Ajouter une ligne vide à la fin
                const emptyDiv = document.createElement('div');
                emptyDiv.innerHTML = `
                    <input type="checkbox" name="peche" disabled>
                    <input type="text" placeholder="Entrez votre péché" oninput="addCheckbox(this)">
                `;
                otherSins.appendChild(emptyDiv);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la restauration:', error);
        console.error('Stack trace:', error.stack);
        // En cas d'erreur, supprimer l'état corrompu
        localStorage.removeItem('confessionState');
    }
}

// Mise à jour de la fonction clean pour utiliser localStorage
function clean() {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });

    const otherSins = document.getElementById('otherSins');
    if (otherSins) {
        let textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(function(input) {
            input.value = '';
        });

        otherSins.innerHTML = `
            <div>
                <input type="checkbox" name="peche" disabled>
                <input type="text" placeholder="Entrez votre péché" oninput="addCheckbox(this)">
            </div>
        `;
    }

    localStorage.removeItem('confessionState');
    toggleBack(null);
}

// Gestion des champs de texte personnalisés
function addCheckbox(input) {
    if (input.value.trim() !== "") {
        input.previousElementSibling.disabled = false;
        input.previousElementSibling.checked = true;
        input.previousElementSibling.value = input.value;
        let allInputs = document.querySelectorAll('#otherSins input[type="text"]');
        if (input === allInputs[allInputs.length - 1]) {
            let newDiv = document.createElement('div');
            newDiv.innerHTML = `
                <input type="checkbox" name="peche" disabled>
                <input type="text" placeholder="Entrez votre péché" oninput="addCheckbox(this)">
            `;
            document.getElementById('otherSins').appendChild(newDiv);
        }
    } else {
        input.previousElementSibling.disabled = true;
        input.previousElementSibling.checked = false;
    }
    saveStateToCookie();
}

// Navigation entre les vues
function toggleBack(event) {
    if (event) event.preventDefault();
    document.getElementById('confession-form').classList.remove('hidden');
    document.getElementById('summary').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Génération du résumé
function generateSummary(event) {
    event.preventDefault();

    const selectedPeches = Array.from(document.querySelectorAll('input[name="peche"]:checked'));
    const pechesList = document.getElementById('peches-list');
    pechesList.innerHTML = '';

    if (selectedPeches.length === 0) {
        pechesList.innerHTML = '<li>Aucun péché sélectionné.</li>';
    } else {
        selectedPeches.forEach(peche => {
            const li = document.createElement('li');
            li.textContent = peche.value;
            pechesList.appendChild(li);
        });
    }

    document.getElementById('confession-form').classList.add('hidden');
    document.getElementById('summary').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fonction pour réinitialiser le formulaire et le stockage
function resetForm() {
    if (confirm("Voulez-vous vraiment effacer toutes vos sélections ?")) {
        clean();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    restoreStateFromCookie();
    
    // Ajouter les listeners sur les checkboxes standards
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:not([disabled])');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveStateToCookie);
    });
});