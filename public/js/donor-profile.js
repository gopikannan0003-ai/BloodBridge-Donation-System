const donorProfileForm =
    document.getElementById("donorProfileForm");

const message =
    document.getElementById("message");


document.addEventListener("DOMContentLoaded", async function () {

    try {

        const response = await fetch("/api/donor/profile");

        const data = await response.json();

        if (!data.success) {

            window.location.href = "login.html";
            return;

        }


        // Existing profile இருந்தால் fields fill ஆகும்
        if (data.profileExists && data.profile) {

            const profile = data.profile;

            document.getElementById("bloodGroup").value =
                profile.blood_group || "";

            document.getElementById("age").value =
                profile.age || "";

            document.getElementById("gender").value =
                profile.gender || "";

            document.getElementById("city").value =
                profile.city || "";

            document.getElementById("address").value =
                profile.address || "";

            document.getElementById("lastDonationDate").value =
                profile.last_donation_date
                    ? profile.last_donation_date.substring(0, 10)
                    : "";
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to load donor profile.";

        message.style.color = "red";
    }

});


// Save profile
donorProfileForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const bloodGroup =
        document.getElementById("bloodGroup").value;

    const age =
        document.getElementById("age").value;

    const gender =
        document.getElementById("gender").value;

    const city =
        document.getElementById("city").value.trim();

    const address =
        document.getElementById("address").value.trim();

    const lastDonationDate =
        document.getElementById("lastDonationDate").value;


    message.textContent = "Saving your profile...";
    message.style.color = "#555";


    try {

        const response = await fetch("/api/donor/profile", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                bloodGroup: bloodGroup,

                age: age,

                gender: gender,

                city: city,

                address: address,

                lastDonationDate: lastDonationDate

            })

        });


        const data = await response.json();


        if (data.success) {

            message.textContent =
                data.message;

            message.style.color = "green";


            setTimeout(() => {

                window.location.href =
                    "donor.html";

            }, 1200);


        } else {

            message.textContent =
                data.message || "Profile save failed.";

            message.style.color = "red";

        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Server connection failed.";

        message.style.color = "red";

    }

});