
Page.StSkills = new Page('Teamdaten', 'st.php', new Page.Param('s', 2), new Page.Param('c'));

Page.StSkills.extract = (doc, data) => {
	return Page.ShowteamSkills.extract(doc, data);
};

Page.StSkills.extend = (doc, data) => {
	return Page.ShowteamSkills.extend(doc, data);
};
