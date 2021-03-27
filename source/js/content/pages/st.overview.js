
Page.StOverview = new Page('Teamdaten', 'st.php', new Page.Param('s', 0, true), new Page.Param('c'));

Page.StOverview.extract = (doc, data) => {
	return Page.ShowteamOverview.extract(doc, data);
};

Page.StOverview.extend = (doc, data) => {
	return Page.ShowteamOverview.extend(doc, data);
};
