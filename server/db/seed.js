const mockProjects = [
  { name: 'Website Redesign', client_name: 'Acme Corp' },
  { name: 'Mobile App', client_name: 'Globex Inc' },
];

export function seed(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM project').get();
  if (count > 0) return;

  const insert = db.prepare('INSERT INTO project (name, client_name) VALUES (@name, @client_name)');
  const insertAll = db.transaction((projects) => {
    for (const project of projects) insert.run(project);
  });
  insertAll(mockProjects);
}
