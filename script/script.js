let combinaisonSecrete = [];
let propositionActuelle = [];
let longueurCombinaison = 4;
let nombreCouleurs = 6;
let maxTentatives = 10;
let tentativesRestantes = maxTentatives;
let historique = [];

// Liste des couleurs disponibles
const couleursDisponibles = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'GreenYellow'
];

// Fonction pour afficher une boîte modale personnalisée
function afficherAlerte(message) {
    const modal = document.getElementById('custom-alert');
    const messageElement = document.getElementById('alert-message');
    const closeButton = document.getElementById('close-alert');

    messageElement.innerHTML = message;

    modal.classList.remove('hidden');
    modal.classList.add('show');

    closeButton.onclick = () => {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    };
}


// Fonction pour générer une combinaison secrète
function genererCombinaison() {
    combinaisonSecrete = [];
    for (let i = 0; i < longueurCombinaison; i++) {
        combinaisonSecrete.push(Math.floor(Math.random() * nombreCouleurs) + 1);
    }
}

function initialiserJeu() {
    const selectLongueur = document.getElementById('longueur');
    const selectCouleurs = document.getElementById('nbr_couleur');
    
    longueurCombinaison = parseInt(selectLongueur.value);
    nombreCouleurs = parseInt(selectCouleurs.value);
    tentativesRestantes = maxTentatives;
    historique = [];
    
    genererCombinaison(); // Créer la combinaison secrète
    
    // Mettre à jour la palette de couleurs
    mettreAJourPaletteDeCouleurs();

    // Afficher le nombre de tentatives restantes
    const tentativesRestantesElement = document.getElementById('tentatives-restantes');
    tentativesRestantesElement.style.display = 'block'; // Afficher l'élément
    tentativesRestantesElement.textContent = `Tentatives restantes : ${tentativesRestantes}`; // Mettre à jour le texte

    // Désactive le bouton "Commencer" et le grise
    document.getElementById('commencer').disabled = true;
    document.getElementById('commencer').classList.add('disabled');
    
    // Cache les options de configuration
    document.getElementById('config-parameters').style.display = 'none';
    
    // Active les éléments du jeu
    document.getElementById('selection-couleurs').style.display = 'flex';
    document.getElementById('valider').disabled = false;
    document.getElementById('reset').disabled = false;
    
    // Désactive la possibilité de changer la configuration
    document.getElementById('longueur').disabled = true;
    document.getElementById('nbr_couleur').disabled = true;
}


// Mise à jour de la palette de couleurs selon le nombre choisi
function mettreAJourPaletteDeCouleurs() {
    const palette = document.getElementById('selection-couleurs');
    palette.innerHTML = '';

    for (let i = 0; i < nombreCouleurs; i++) {
        const boutonCouleur = document.createElement('button');
        boutonCouleur.classList.add('couleur');
        boutonCouleur.setAttribute('data-couleur', i + 1);
        boutonCouleur.style.backgroundColor = couleursDisponibles[i];
        
        boutonCouleur.addEventListener('click', () => {
            if (propositionActuelle.length < longueurCombinaison) {
                propositionActuelle.push(i + 1);
                afficherProposition();
            }
        });
        
        palette.appendChild(boutonCouleur);
    }
}

// Réinitialiser la proposition actuelle
document.getElementById('supprimer').addEventListener('click', () => {
    propositionActuelle = [];
    afficherProposition();
    
    if (propositionActuelle.length === 0) {
        document.getElementById('supprimer').disabled = true;
    }
});

// Mise à jour de la proposition de l'utilisateur
document.querySelectorAll('.couleur').forEach(bouton => {
    bouton.addEventListener('click', () => {
        if (propositionActuelle.length < longueurCombinaison) {
            propositionActuelle.push(parseInt(bouton.getAttribute('data-couleur')));
            afficherProposition();
        }
    });
});

// Afficher la proposition actuelle
function afficherProposition() {
    const zoneProposition = document.getElementById('proposition-actuelle');
    zoneProposition.innerHTML = propositionActuelle.map(couleur => {
        return `<div class="couleur-selectionnee" style="background-color: ${obtenirCouleur(couleur)};"></div>`;
    }).join('');

    document.getElementById('supprimer').disabled = (propositionActuelle.length === 0);
}

// Fonction pour convertir le numéro de couleur en nom de couleur CSS
function obtenirCouleur(numero) {
    return couleursDisponibles[numero - 1];
}

// Vérifier la proposition de l'utilisateur
document.getElementById('valider').addEventListener('click', () => {
    if (propositionActuelle.length !== longueurCombinaison) {
        afficherAlerte('Veuillez sélectionner ' + longueurCombinaison + ' couleurs.');
        return;
    }

    verifierProposition(propositionActuelle);
    propositionActuelle = [];
    afficherProposition();
});

function verifierProposition(proposition) {
    let bienPlaces = 0;
    let malPlaces = 0;
    let absentes = 0;
    const copieCombinaison = [...combinaisonSecrete];
    const copieProposition = [...proposition];

    // Vérifier les couleurs bien placées
    copieProposition.forEach((couleur, index) => {
        if (couleur === copieCombinaison[index]) {
            bienPlaces++;
            copieCombinaison[index] = null; 
            copieProposition[index] = null;
        }
    });

    // Vérifier les couleurs mal placées
    copieProposition.forEach((couleur, index) => {
        if (couleur && copieCombinaison.includes(couleur)) {
            malPlaces++;
            copieCombinaison[copieCombinaison.indexOf(couleur)] = null; 
        } else if (couleur) {
            absentes++;
        }
    });

    tentativesRestantes--;

    // Mettre à jour les tentatives restantes dans l'affichage
    const tentativesRestantesElement = document.getElementById('tentatives-restantes');
    tentativesRestantesElement.textContent = `Tentatives restantes : ${tentativesRestantes}`;

    // Ajouter la tentative à l'historique
    historique.push(creerHistoriqueAffiche(proposition, bienPlaces, malPlaces, absentes));
    afficherHistorique();

    // Vérification des conditions de fin de jeu
    if (bienPlaces === longueurCombinaison) {
        afficherAlerte(`Bravo ! Vous avez trouvé la combinaison en ${maxTentatives - tentativesRestantes} tentatives !`);
        bloquerJeu();
    } else if (tentativesRestantes === 0) {
        const combinaisonHtml = combinaisonSecrete.map(couleur => 
            `<div class="couleur-selectionnee" style="background-color: ${obtenirCouleur(couleur)}; display: inline-block; width: 20px; height: 20px; border-radius: 50%; margin: 0 5px;"></div>`
        ).join('');
        afficherAlerte(`Perdu ! La combinaison secrète était : <br><br> ${combinaisonHtml}`);
        bloquerJeu();
    }
}


function creerHistoriqueAffiche(proposition, bienPlaces, malPlaces, absentes) {
    let historiqueAffiche = proposition.map((couleur) => {
        return `<div class="historique-couleur" style="background-color: ${obtenirCouleur(couleur)};"></div>`;
    }).join('');

    // Ajouter les indicateurs pour les bien placés, mal placés et absents
    let feedback = '';
    for (let i = 0; i < bienPlaces; i++) {
        feedback += `<div class="feedback-bien-place"></div>`; 
    }
    for (let i = 0; i < malPlaces; i++) {
        feedback += `<div class="feedback-mal-place"></div>`; 
    }
    for (let i = 0; i < absentes; i++) {
        feedback += `<div class="feedback-absente"></div>`; 
    }

    return `<div class="historique-tentative">${historiqueAffiche} ${feedback}</div>`;
}

// Afficher l'historique des tentatives avec des couleurs
function afficherHistorique() {
    const zoneResultats = document.querySelector('footer');
    zoneResultats.innerHTML = historique.join('<br>');
    scrollToBottom(); 
}

// Réinitialiser le jeu
document.getElementById('reset').addEventListener('click', () => {
    propositionActuelle = [];
    tentativesRestantes = maxTentatives;
    historique = [];
    genererCombinaison();
    mettreAJourPaletteDeCouleurs();

    document.getElementById('proposition-actuelle').innerHTML = '';
    document.querySelector('footer').innerHTML = '';

    // Réinitialiser l'état de la configuration et réafficher les éléments
    document.getElementById('commencer').disabled = false;
    document.getElementById('commencer').classList.remove('disabled');
    document.getElementById('config-parameters').style.display = 'block';
    
    // Réactiver les sélecteurs de configuration
    document.getElementById('longueur').disabled = false;
    document.getElementById('nbr_couleur').disabled = false;
    
    // Réinitialiser les éléments du jeu
    document.getElementById('selection-couleurs').style.display = 'none';
    document.getElementById('valider').disabled = true;
    document.getElementById('reset').disabled = true;

    document.getElementById('tentatives-restantes').style.display = 'none';    
});

function scrollToBottom() {
    const historiqueElement = document.querySelector('footer.historique');
    historiqueElement.scrollTop = historiqueElement.scrollHeight;
}


// Bloquer le jeu après la fin
function bloquerJeu() {
    document.querySelectorAll('.couleur').forEach(bouton => bouton.disabled = true);
    document.getElementById('valider').disabled = true;
}

// Démarrer le jeu au clic sur "Commencer"
document.getElementById('commencer').addEventListener('click', initialiserJeu);

// Générer la combinaison secrète initiale
genererCombinaison();
