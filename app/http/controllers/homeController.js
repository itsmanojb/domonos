const Menu = require('../../models/menu');

function homeController() {
  return {
    async index(req, res) {

      try {

        const data = await Menu.find();
        const allMenus = data.map(menu => menu.toObject());

        const menus = allMenus.reduce((menus, item) => {
          const group = (menus[item.menuType] || []);
          group.push(item);
          menus[item.menuType] = group;
          return menus;
        }, {});

        const veg = [],
          nonveg = [];
        const shuffled = menus.pizza.sort(() => 0.5 - Math.random());

        const modified = menus.pizza.map(item => {
          if (item.menuType === 'pizza') {
            let price = item.options.prices.filter(p => p.size === 'regular')[0].crusts[0];
            item['price'] = price
          }
          return item;
        });

        modified.forEach(item => {
          if (item.foodType === 'veg') {
            veg.push(item);
          } else {
            nonveg.push(item);
          }
        });


        // res.json(modified)

        res.render('home', {
          menus: {
            ...menus,
            veg,
            nonveg,
            topMenu: shuffled.slice(0, 12)
          }
        });

      } catch (error) {
        console.log(error);
        process.exit();
      }
    },
  };
}

module.exports = homeController;