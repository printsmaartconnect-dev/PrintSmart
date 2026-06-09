const dns = require('dns');

dns.resolveCname('db.hqlnmdtsdmehfsfjtucd.supabase.co', (err, addresses) => {
  if (err) {
    console.error('CNAME Lookup failed:', err);
  } else {
    console.log('CNAME Addresses:', addresses);
  }
});

dns.lookup('db.hqlnmdtsdmehfsfjtucd.supabase.co', (err, address, family) => {
  if (err) {
    console.error('IP Lookup failed:', err);
  } else {
    console.log('IP Address:', address, 'Family: IPv' + family);
  }
});

dns.resolveAny('db.hqlnmdtsdmehfsfjtucd.supabase.co', (err, records) => {
  if (err) {
    console.error('ResolveAny failed:', err);
  } else {
    console.log('DNS Records:', records);
  }
});
