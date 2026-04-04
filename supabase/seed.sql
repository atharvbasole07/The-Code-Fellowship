insert into zones (id, name, city, connectivity_type)
values
  ('9fd20fca-01d2-4440-b5b5-6859c3a109f1', 'Koregaon Park', 'Pune', 'LoRaWAN'),
  ('30dc1b6d-0d50-4ce8-a1b8-8cb37c2c6d55', 'Shivajinagar', 'Pune', '4G'),
  ('479123a0-a26e-4a1c-970d-91cc794f5d74', 'Hadapsar', 'Pune', 'NB-IoT'),
  ('0f2f1800-97e2-4cfd-a1b9-511394f7f8b0', 'Kothrud', 'Pune', 'LoRaWAN')
on conflict (id) do nothing;

insert into drivers (id, email, full_name, phone, employee_code, truck_id, assigned_zone_id, is_active)
values
  ('8cb373ce-63de-4db6-95af-9ce58858788a', 'driver@pune.gov.in', 'A. Shinde', '+91-9876543210', 'DRV-001', 'TR-02', '479123a0-a26e-4a1c-970d-91cc794f5d74', true),
  ('5d2de13f-24b1-4698-aaf7-86a0f009a6a5', 'kpatil@pune.gov.in', 'K. Patil', '+91-9876543211', 'DRV-002', 'TR-11', '0f2f1800-97e2-4cfd-a1b9-511394f7f8b0', true),
  ('1e53e6f1-ae8b-4d5e-808f-a99f6d9f6eb0', 'njadhav@pune.gov.in', 'N. Jadhav', '+91-9876543212', 'DRV-003', 'TR-14', '9fd20fca-01d2-4440-b5b5-6859c3a109f1', true)
on conflict (id) do nothing;

insert into bins (id, zone_id, name, lat, lng, fill_level, weight_kg, odor_level, temperature_c, battery_level, is_online, last_seen_at)
values
  ('11d4017b-f899-4c42-841e-a140f8b094c5','9fd20fca-01d2-4440-b5b5-6859c3a109f1','KP-01 River Walk',18.5368,73.8941,88,41.2,8.2,32.1,38,true,now() - interval '24 minutes'),
  ('73b4d3ec-83c2-4d5a-b68d-6df42fd0eec8','9fd20fca-01d2-4440-b5b5-6859c3a109f1','KP-02 North Avenue',18.5342,73.8993,64,28.1,6.3,30.5,74,true,now() - interval '66 minutes'),
  ('8d89e4f4-b922-4a8c-83ff-4f897f3ca794','9fd20fca-01d2-4440-b5b5-6859c3a109f1','KP-03 Plaza Lane',18.5381,73.9018,29,10.6,2.8,28.1,81,true,now() - interval '138 minutes'),
  ('f9716f1b-fc53-4a36-b221-360d535f94a5','9fd20fca-01d2-4440-b5b5-6859c3a109f1','KP-04 Garden Square',18.5402,73.8964,92,44.5,9.1,34.2,22,true,now() - interval '12 minutes'),
  ('ff61f58b-7dc9-469e-92d7-d1ed230f0ba4','9fd20fca-01d2-4440-b5b5-6859c3a109f1','KP-05 East Drive',18.5324,73.9023,47,18.3,4.2,29.6,66,false,now() - interval '7 hours'),
  ('8e132653-9168-44ab-850b-2203e05ee5d5','30dc1b6d-0d50-4ce8-a1b8-8cb37c2c6d55','SV-01 Station Road',18.5319,73.8487,73,31.9,5.2,31.1,51,true,now() - interval '48 minutes'),
  ('981c33c1-6885-45b6-a4ff-6e5100c08c17','30dc1b6d-0d50-4ce8-a1b8-8cb37c2c6d55','SV-02 Court Junction',18.5283,73.8524,18,7.2,1.6,27.8,92,true,now() - interval '3 hours'),
  ('601f4fe4-f4d4-46f6-87fb-b56084bf6117','30dc1b6d-0d50-4ce8-a1b8-8cb37c2c6d55','SV-03 University Gate',18.5464,73.8292,84,39.1,7.4,33.3,34,true,now() - interval '30 minutes'),
  ('d38d0ae6-3c8c-4a31-b5ee-081a11561b25','30dc1b6d-0d50-4ce8-a1b8-8cb37c2c6d55','SV-04 Civic Plaza',18.5268,73.8471,52,21.4,4.8,29.4,57,true,now() - interval '96 minutes'),
  ('d6e421d4-77ff-40d4-befb-ac49c2d5c52c','30dc1b6d-0d50-4ce8-a1b8-8cb37c2c6d55','SV-05 Bus Depot',18.5274,73.8562,67,25.5,6.1,30.2,43,true,now() - interval '54 minutes'),
  ('dbd7c617-f3fc-43bb-86fa-8f33e5d0be10','479123a0-a26e-4a1c-970d-91cc794f5d74','HD-01 Magar Ring',18.5088,73.9284,95,45.7,8.8,34.4,26,true,now() - interval '8 minutes'),
  ('7f3535a2-fec3-488e-a2ab-76db85330f40','479123a0-a26e-4a1c-970d-91cc794f5d74','HD-02 Market Link',18.5007,73.9318,76,33.1,7.2,32.7,61,true,now() - interval '42 minutes'),
  ('402a3c37-833a-4d4f-8a51-4d62965b5d6d','479123a0-a26e-4a1c-970d-91cc794f5d74','HD-03 Tech Park',18.5164,73.9363,35,12.5,2.4,28.6,89,true,now() - interval '5 hours'),
  ('5f440965-3393-49f8-bec7-035ddf83373c','479123a0-a26e-4a1c-970d-91cc794f5d74','HD-04 Canal Edge',18.4973,73.9241,58,23.4,5.3,30.4,79,true,now() - interval '84 minutes'),
  ('f9a8e1c3-0e78-486d-a28c-f2968afee65d','479123a0-a26e-4a1c-970d-91cc794f5d74','HD-05 Transit Point',18.5031,73.9392,81,37.2,7.5,31.9,48,false,now() - interval '8 hours'),
  ('bd638fe2-595d-4cd7-aee5-35eefce3623f','0f2f1800-97e2-4cfd-a1b9-511394f7f8b0','KT-01 Paud Hub',18.5076,73.8073,44,17.1,3.5,28.9,88,true,now() - interval '2 hours'),
  ('b82632bf-b71f-4b7b-a9ab-a049b2344205','0f2f1800-97e2-4cfd-a1b9-511394f7f8b0','KT-02 Temple Circle',18.5041,73.8141,69,26.8,5.9,30.6,64,true,now() - interval '36 minutes'),
  ('4b6f2828-7d68-4981-9d9e-f7ee8e5dad57','0f2f1800-97e2-4cfd-a1b9-511394f7f8b0','KT-03 Metro Feeder',18.5012,73.8218,15,6.3,1.4,27.5,97,true,now() - interval '5 hours'),
  ('1e874b8c-cfb9-4c06-8c46-d39c1f70bc1d','0f2f1800-97e2-4cfd-a1b9-511394f7f8b0','KT-04 Housing Board',18.4958,73.8169,83,35.1,7.1,32.4,37,true,now() - interval '18 minutes'),
  ('f1b828ff-3779-4227-b45c-9cc31a9d690c','0f2f1800-97e2-4cfd-a1b9-511394f7f8b0','KT-05 Park Ridge',18.4989,73.8098,61,24.7,5.1,29.8,72,true,now() - interval '108 minutes')
on conflict (id) do nothing;

insert into alerts (bin_id, type, severity, message, resolved, created_at, resolved_at)
values
  ('11d4017b-f899-4c42-841e-a140f8b094c5','overflow_risk','critical','Bin approaching overflow before evening collection window.',false,now() - interval '30 minutes',null),
  ('f9716f1b-fc53-4a36-b221-360d535f94a5','low_battery','high','Battery level dropped below 25%. Maintenance check recommended.',false,now() - interval '3 hours',null),
  ('601f4fe4-f4d4-46f6-87fb-b56084bf6117','odor_spike','high','Odor sensor registered sustained spike for 25 minutes.',false,now() - interval '80 minutes',null),
  ('dbd7c617-f3fc-43bb-86fa-8f33e5d0be10','overflow_risk','critical','High footfall area at 95% fill level.',false,now() - interval '12 minutes',null),
  ('f9a8e1c3-0e78-486d-a28c-f2968afee65d','sensor_offline','medium','Telemetry stopped reporting for more than 8 hours.',false,now() - interval '8 hours',null),
  ('1e874b8c-cfb9-4c06-8c46-d39c1f70bc1d','tamper','low','Bin door open event detected after scheduled service hours.',false,now() - interval '5 hours',null),
  ('8e132653-9168-44ab-850b-2203e05ee5d5','odor_spike','medium','Odor reading crossed configured hygiene threshold.',true,now() - interval '25 hours',now() - interval '21 hours'),
  ('b82632bf-b71f-4b7b-a9ab-a049b2344205','low_battery','low','Battery trending below recommended reserve.',true,now() - interval '34 hours',now() - interval '30 hours');

insert into collection_events (bin_id, truck_id, driver_name, fill_at_collection, weight_collected_kg, co2_saved_kg, collected_at)
values
  ('11d4017b-f899-4c42-841e-a140f8b094c5','TR-14','S. Jadhav',91,42.3,29.4,now() - interval '2 days'),
  ('f9716f1b-fc53-4a36-b221-360d535f94a5','TR-07','R. More',84,39.8,26.1,now() - interval '4 days'),
  ('601f4fe4-f4d4-46f6-87fb-b56084bf6117','TR-05','P. Pawar',87,36.2,24.9,now() - interval '3 days'),
  ('dbd7c617-f3fc-43bb-86fa-8f33e5d0be10','TR-02','A. Shinde',90,43.6,28.6,now() - interval '1 day'),
  ('7f3535a2-fec3-488e-a2ab-76db85330f40','TR-02','A. Shinde',72,30.1,19.8,now() - interval '6 days'),
  ('1e874b8c-cfb9-4c06-8c46-d39c1f70bc1d','TR-11','K. Patil',81,35.3,23.5,now() - interval '5 days'),
  ('f1b828ff-3779-4227-b45c-9cc31a9d690c','TR-11','K. Patil',68,24.9,18.4,now() - interval '7 days'),
  ('d6e421d4-77ff-40d4-befb-ac49c2d5c52c','TR-09','N. Salunkhe',74,29.1,20.3,now() - interval '8 days');

insert into fill_history (bin_id, fill_level, weight_kg, odor_level, recorded_at)
select
  b.id,
  greatest(4, least(99, b.fill_level - ((12 - gs.step) * 4) + floor(random() * 8)::int)),
  greatest(2, (b.weight_kg * 0.65) + (random() * 6)),
  greatest(0.5, least(10, b.odor_level * 0.8 + random() * 2)),
  now() - ((12 - gs.step) * interval '2 hours')
from bins b
cross join generate_series(1, 12) as gs(step);
