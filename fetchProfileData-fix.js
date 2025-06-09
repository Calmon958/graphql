async function fetchProfileData() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('No token found');
    }

    try {
        // Use a CORS proxy to bypass the CORS restrictions
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';
        
        const response = await fetch(proxyUrl + targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Origin': 'https://learn.zone01kisumu.ke'
            },
            body: JSON.stringify({
                query: `
                    query {
                        user {
                            id
                            login
                        }
                        
                        moduleXP: transaction(
                            where: {
                                type: {_eq: "xp"},
                                path: {_like: "/kisumu/module/%"},
                                _and: {
                                    path: {_nlike: "%piscine%"}
                                }
                            }
                        ) {
                            amount
                            createdAt
                            path
                        }
                        
                        skills: transaction(
                            where: {
                                type: {_like: "skill_%"}
                            },
                            order_by: {
                                createdAt: desc
                            }
                        ) {
                            type
                            amount
                            createdAt
                        }
                        
                        auditsDone: transaction(
                            where: {
                                type: {_eq: "up"},
                                path: {_like: "/kisumu/module/%"}
                            }
                        ) {
                            amount
                            createdAt
                        }
                        
                        auditsReceived: transaction(
                            where: {
                                type: {_eq: "down"},
                                path: {_like: "/kisumu/module/%"}
                            }
                        ) {
                            amount
                            createdAt
                        }
                    }
                `
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        displayProfileData(data.data);
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}