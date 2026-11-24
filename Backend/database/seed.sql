USE tiffin_flow;

INSERT INTO menu_items
(name, description, category, regular_price, subscription_price, mini_price, is_veg, image_url, calories, protein, carbs, fat, fiber, spice_level)
VALUES
('Royal Shahi Paneer Thali','Paneer in rich gravy with rice, roti and sides.','lunch',180,150,130,1,'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',620,24,72,22,9,2),
('Dal Makhani & Basmati Rice','Slow-cooked black lentils with fragrant basmati rice.','lunch',150,125,105,1,'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',540,18,78,16,11,2),
('Grilled Chicken Bowl','Herb-marinated chicken with greens and grains.','lunch',220,185,165,0,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',510,38,44,15,8,1),
('Vegetable Khichdi','Comforting rice and lentil meal with seasonal vegetables.','dinner',140,115,95,1,'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',480,16,75,10,10,1),
('Gulab Jamun (2 pcs)','Classic Indian dessert.','snacks',45,40,35,1,'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=600',220,4,36,8,1,1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO coupons
(code, discount_type, discount_value, min_order_value, max_discount, usage_limit, expires_at)
VALUES
('TIFFIN50','fixed',50,200,50,1000,'2027-12-31 23:59:59'),
('WELCOME10','percentage',10,300,100,1000,'2027-12-31 23:59:59')
ON DUPLICATE KEY UPDATE code = VALUES(code);