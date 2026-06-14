import http from 'http';

const checkRoute = (route) => {
  http.get(`http://localhost:3000${route}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(route, res.statusCode, data.slice(0, 100)));
  });
};

checkRoute('/api/p2p/listings');
checkRoute('/api/admin/inventory');
checkRoute('/api/admin/queue');
checkRoute('/api/returns/policy-summary'); // this is a POST, so we'll do GET just to see if it 404s
