async function main() {
  console.log('Logging in...');
  const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: 'rm_demo', password: 'demo-password-change-me' })
  });
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    return;
  }
  const token = (await loginRes.json()).access_token;
  console.log('Got token');

  const res = await fetch('http://localhost:8000/api/v1/customers?page=1&page_size=200', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  const customers = data.items || data;
  console.log('Found ' + customers.length + ' customers.');
  let count = 0;
  for (const c of customers) {
    if (count >= 100) break;
    try {
      const predRes = await fetch('http://localhost:8000/api/v1/customers/' + c.id + '/churn/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ as_of_date: '2026-09-15' })
      });
      if (predRes.ok) {
        console.log('Predicted ' + c.id);
      } else {
        console.error('Failed ' + c.id + ' with status ' + predRes.status);
      }
    } catch (e) {
      console.error(e);
    }
    count++;
  }
}
main();
