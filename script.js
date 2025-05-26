// Initialize Supabase only if needed
const supabaseUrl = "https://brxituhthyyvtjkbonxm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeGl0dWh0aHl5dnRqa2JvbnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTk5NjQsImV4cCI6MjA2MTEzNTk2NH0.5DItQGaYbPU5MUa7TqKKLfW5-05HVnRUYeLpoFaVAl4";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded.");

  // If login form exists, run login logic
  const form = document.querySelector(".form-container");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailOrName = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!emailOrName || !password) {
        alert("Please enter your credentials.");
        return;
      }

      const { data: users, error } = await supabaseClient
        .from("users")
        .select("*")
        .or(`email.eq.${emailOrName},name.eq.${emailOrName}`);

      if (error || users.length === 0) {
        alert("User not found.");
        return;
      }

      const user = users[0];

      if (user.password !== password) {
        alert("Incorrect password.");
        return;
      }

      alert("Login successful!");
      window.location.href = "main.html";
    });
  }
});