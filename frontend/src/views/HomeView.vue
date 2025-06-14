<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1>Bine ați venit la <span class="brand-text">WebMed</span></h1>
        <p class="tagline">Sănătatea dvs., simplificată.</p>
        <p class="subtitle">Platforma modernă care conectează pacienții și medicii pentru o îngrijire medicală mai bună.</p>
        
        <div class="cta-buttons">
          <router-link to="/register" class="btn btn-primary">Înregistrare</router-link>
          <router-link to="/login" class="btn btn-secondary">Autentificare</router-link>
        </div>
      </div>
      <div class="hero-image"></div>
    </div>

    <div class="visitor-section">
      <h2>Programare Rapidă pentru Vizitatori</h2>
      <p class="visitor-intro">Nu doriți să creați un cont? Completați formularul de mai jos pentru o programare rapidă.</p>
      
      <div class="visitor-links">
        <router-link to="/confirmare-programare" class="confirm-link">Aveți deja un cod de confirmare? Verificați sau confirmați programarea aici</router-link>
        <router-link to="/access-test" class="confirm-link">Aveți un cod de acces pentru analize? Vedeți rezultatele analizelor dvs.</router-link>
      </div>
      
      <div v-if="!formSubmitted || !confirmationDetails" class="visitor-form-wrapper">
        <form @submit.prevent="handleVisitorSubmit" class="visitor-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nume*</label>
              <input type="text" v-model="visitorForm.lastName" required>
            </div>
            <div class="form-group">
              <label>Prenume*</label>
              <input type="text" v-model="visitorForm.firstName" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Email*</label>
              <input type="email" v-model="visitorForm.email" required>
            </div>
            <div class="form-group">
              <label>Telefon*</label>
              <input type="tel" v-model="visitorForm.phone" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Specialitate*</label>
              <select v-model="visitorForm.specialty" required>
                <option value="">Selectați specialitatea</option>
                <option value="medicina-generala">Medicină Generală</option>
                <option value="cardiologie">Cardiologie</option>
                <option value="dermatologie">Dermatologie</option>
                <option value="neurologie">Neurologie</option>
                <option value="oftalmologie">Oftalmologie</option>
                <option value="pediatrie">Pediatrie</option>
                <option value="ortopedia">Ortopedie</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data Preferată*</label>
              <input type="date" v-model="visitorForm.preferredDate" required>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label>Simptome / Notițe</label>
            <textarea v-model="visitorForm.notes" placeholder="Descrieți pe scurt motivul programării..."></textarea>
          </div>
          
          <div class="form-submit">
            <button type="submit" class="btn-visitor-submit">
              <span>Solicitare Programare</span>
            </button>
            <p class="form-note">* Câmpuri obligatorii</p>
          </div>
        </form>
      </div>
      
      <div v-else-if="confirmationDetails" class="confirmation-section">
        <div class="confirmation-message">
          <h3>Programare Înregistrată cu Succes!</h3>
          <p>Programarea dumneavoastră a fost înregistrată în sistemul nostru. Pentru a confirma programarea, apăsați butonul de mai jos.</p>
          
          <div class="confirmation-details">
            <p><strong>ID Programare:</strong> {{ confirmationDetails.appointmentId }}</p>
            <p><strong>Cod de Confirmare:</strong> {{ confirmationDetails.confirmationCode }}</p>
            <p class="save-info">Vă rugăm să salvați aceste informații pentru referințe viitoare.</p>
          </div>
          
          <button @click="confirmAppointment" class="btn-confirm">Confirm Programarea</button>
          
          <p class="confirmation-info">După confirmare, veți fi contactat de personalul nostru medical pentru detalii suplimentare.</p>
        </div>
      </div>
      
      <div v-if="confirmationError" class="error-message">
        {{ confirmationError }}
      </div>
    </div>

    <div class="features">
      <div class="feature">
        <div class="feature-icon">
          <i class="icon-consultation">📱</i>
        </div>
        <h3>Consultații Online</h3>
        <p>Conectați-vă cu medicii de la distanță, din confortul casei dumneavoastră. Obțineți sfaturi medicale profesionale fără a fi nevoie să călătoriți.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <i class="icon-security">🔒</i>
        </div>
        <h3>Fișe Medicale Securizate</h3>
        <p>Datele dumneavoastră medicale sunt protejate cu cele mai înalte standarde de securitate. Accesați istoricul medical complet oricând.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <i class="icon-calendar">📅</i>
        </div>
        <h3>Programări Facile</h3>
        <p>Faceți și gestionați programările cu ușurință. Primiți notificări și reprogramați cu doar câteva clicuri.</p>
      </div>
    </div>

    <div class="testimonials">
      <h2>De Încredere pentru Pacienți și Medici</h2>
      <div class="testimonial-grid">
        <div class="testimonial">
          <p>"WebMed a transformat modul în care accesez serviciile medicale. Platforma este intuitivă și conectarea cu specialiștii este acum fără efort."</p>
          <div class="testimonial-author">— Maria I., Pacient</div>
        </div>
        <div class="testimonial">
          <p>"Ca medic, această platformă mi-a permis să ajung la mai mulți pacienți și să-mi gestionez practica mai eficient."</p>
          <div class="testimonial-author">— Dr. Mihai T., Cardiolog</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HomeView',
  data() {
    return {
      visitorForm: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialty: '',
        preferredDate: '',
        notes: ''
      },
      formSubmitted: false,
      confirmationDetails: null,
      confirmationError: null
    }
  },
  methods: {
    async handleVisitorSubmit() {
      try {
        console.log('Formular trimis:', this.visitorForm)
        const response = await axios.post('http://localhost:5000/api/visitor-appointment', this.visitorForm);
        console.log('Programare solicitată:', response.data);
        this.confirmationDetails = {
          appointmentId: response.data.appointmentId,
          confirmationCode: response.data.confirmationCode
        };
        this.confirmationError = null;
        this.visitorForm = {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          specialty: '',
          preferredDate: '',
          notes: ''
        };
        
        this.formSubmitted = true;
      } catch (error) {
        console.error('Trimiterea a eșuat:', error);
        this.confirmationError = 'Ne pare rău, a apărut o eroare. Vă rugăm să încercați din nou sau contactați-ne direct.';
      }
    },
    
    async confirmAppointment() {
      try {
        if (!this.confirmationDetails) return;
        
        const { appointmentId, confirmationCode } = this.confirmationDetails;
        const response = await axios.post(`http://localhost:5000/api/visitor-appointment/confirm/${appointmentId}/${confirmationCode}`);
        
        alert('Programarea dvs. a fost confirmată cu succes!');
        this.confirmationDetails = null;
      } catch (error) {
        console.error('Confirmarea a eșuat:', error);
        alert('A apărut o eroare la confirmarea programării. Vă rugăm să încercați din nou.');
      }
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero {
  display: flex;
  padding: 80px 0 60px;
  align-items: center;
  gap: 40px;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  flex: 1;
  text-align: left;
}

.hero-image {
  flex: 1;
  height: 400px;
  background-image: url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #333;
  animation: slideIn 1.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-text {
  color: #cc0000;
  position: relative;
}

.brand-text::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #cc0000, transparent);
}

.tagline {
  font-size: 1.8rem;
  color: #990000;
  margin-bottom: 1.5rem;
  font-weight: 500;
  animation: slideIn 1.4s ease-out;
}

.subtitle {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 90%;
  animation: slideIn 1.6s ease-out;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  animation: fadeIn 1.8s ease-out;
}

.btn {
  padding: 14px 35px;
  border-radius: 50px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background-color: #cc0000;
  color: white;
}

.btn-primary:hover {
  background-color: #aa0000;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(204, 0, 0, 0.2);
}

.btn-secondary {
  border: 2px solid #cc0000;
  color: #cc0000;
  background-color: transparent;
}

.btn-secondary:hover {
  background-color: #fff3f3;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(204, 0, 0, 0.1);
}

/* Visitor Form Section */
.visitor-section {
  animation: fadeIn 0.5s ease-out;
  background: linear-gradient(135deg, #fcf4f4, #fff);
  padding: 60px;
  border-radius: 20px;
  margin: 60px 0;
  box-shadow: 0 20px 40px rgba(204, 0, 0, 0.05);
}

.visitor-section h2 {
  margin: 0 0 30px;
  color: #cc0000;
  font-size: 2.2em;
  text-align: center;
  background: linear-gradient(45deg, #cc0000, #ff0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.visitor-intro {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.1em;
  line-height: 1.6;
}

.visitor-links {
  text-align: center;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.confirm-link {
  color: #cc0000;
  text-decoration: none;
  padding: 15px 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-weight: 500;
  display: block;
}

.confirm-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(204, 0, 0, 0.15);
  background: #fff3f3;
}

.visitor-form-wrapper {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(204, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.visitor-form-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #cc0000, #ff0000);
}

.visitor-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-row {
  display: flex;
  gap: 25px;
  margin-bottom: 0;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.full-width {
  width: 100%;
}

label {
  color: #990000;
  font-weight: 600;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input, select, textarea {
  padding: 14px 18px;
  border: 2px solid #ffeeee;
  border-radius: 12px;
  font-size: 1rem;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  transition: all 0.3s ease;
  color: #333;
  font-family: inherit;
}

input:hover, select:hover, textarea:hover {
  border-color: #ffcccc;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #cc0000;
  box-shadow: 0 0 0 4px rgba(204, 0, 0, 0.1);
  background: white;
}

textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

.form-submit {
  margin-top: 35px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.btn-visitor-submit {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  padding: 16px 40px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(204, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.btn-visitor-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(204, 0, 0, 0.3);
  background: linear-gradient(135deg, #ff0000, #cc0000);
}

.btn-visitor-submit:active {
  transform: translateY(1px);
}

.form-note {
  color: #777;
  font-size: 0.9rem;
  font-style: italic;
}

.confirmation-section {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(204, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.confirmation-message h3 {
  color: #cc0000;
  font-size: 1.8em;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #cc0000, #ff0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.confirmation-details {
  background: #fff8f8;
  padding: 25px;
  border-radius: 15px;
  margin: 30px 0;
  text-align: left;
}

.confirmation-details p {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ffeeee;
}

.confirmation-details p:last-child {
  border-bottom: none;
}

.confirmation-details strong {
  color: #990000;
}

.save-info {
  color: #666;
  font-style: italic;
  margin-top: 15px;
  font-size: 0.9em;
}

.btn-confirm {
  background: linear-gradient(135deg, #28a745, #218838);
  color: white;
  padding: 16px 40px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.2);
  margin: 20px 0;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(40, 167, 69, 0.3);
  background: linear-gradient(135deg, #34ce57, #28a745);
}

.error-message {
  background: #fff0f0;
  color: #cc0000;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
  text-align: center;
  border-left: 4px solid #cc0000;
  font-weight: 500;
}

@media (max-width: 768px) {
  .visitor-section {
    padding: 30px 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .visitor-form-wrapper {
    padding: 30px 20px;
  }

  .btn-visitor-submit {
    width: 100%;
  }
}

.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 80px 0;
  gap: 30px;
  animation: fadeIn 2s ease-out;
}

.feature {
  flex: 1;
  min-width: 280px;
  padding: 40px 30px;
  border-radius: 15px;
  background-color: white;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-top: 5px solid transparent;
}

.feature:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border-top: 5px solid #cc0000;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff3f3, #ffecec);
  margin-bottom: 25px;
  font-size: 2rem;
}

.feature h3 {
  color: #cc0000;
  margin-bottom: 15px;
  font-size: 1.4rem;
}

.feature p {
  color: #555;
  line-height: 1.7;
}

.testimonials {
  padding: 80px 0;
  text-align: center;
  animation: fadeIn 2.2s ease-out;
}

.testimonials h2 {
  margin-bottom: 40px;
  color: #333;
  font-size: 2.2rem;
}

.testimonial-grid {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.testimonial {
  flex: 1;
  min-width: 280px;
  background: linear-gradient(135deg, #fff, #fff5f5);
  padding: 35px;
  border-radius: 15px;
  text-align: left;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  position: relative;
}

.testimonial::before {
  content: "\201C";
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 5rem;
  color: rgba(204, 0, 0, 0.1);
  font-family: Georgia, serif;
  line-height: 0;
}

.testimonial p {
  font-style: italic;
  color: #555;
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.testimonial-author {
  color: #990000;
  font-weight: 600;
}

@media (max-width: 960px) {
  .hero {
    flex-direction: column-reverse;
    text-align: center;
    padding: 40px 0;
  }
  
  .hero-content {
    text-align: center;
  }
  
  .subtitle {
    max-width: 100%;
  }
  
  .cta-buttons {
    justify-content: center;
  }
  
  .visitor-section {
    padding: 40px 20px;
  }
  
  .visitor-form-wrapper {
    padding: 30px 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .features, .testimonial-grid {
    flex-direction: column;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .tagline {
    font-size: 1.5rem;
  }
  
  .hero-image {
    height: 300px;
    width: 100%;
  }
}
</style> 