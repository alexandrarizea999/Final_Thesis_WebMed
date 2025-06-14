router.get('/for-doctor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot accesa această resursă.' });
    }
    const visitors = await VisitorAppointment.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      group: ['id', 'firstName', 'lastName', 'email', 'phone'], 
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    const formattedVisitors = visitors.map(visitor => ({
      id: `visitor_${visitor.id}`, 
      first_name: visitor.firstName,
      last_name: visitor.lastName,
      email: visitor.email,
      phone_number: visitor.phone,
      is_visitor: true
    }));
    console.log("Returning visitors:", formattedVisitors);
    res.json(formattedVisitors);
  } catch (error) {
    console.error('Eroare la obținerea vizitatorilor:', error);
    res.status(500).json({ message: 'Eroare internă server', error: error.message });
  }
}); 