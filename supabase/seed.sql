-- Optional seed. Runs as postgres (bypasses RLS); submitted_by stays null.
insert into public.apps (name, category, ram_mb, description, submitter_name) values
  ('Slack',          'electron',    1200, 'Idle. One workspace. Zero messages sent.',              'seed'),
  ('Microsoft Teams','electron',    1800, 'Just the "your meeting is starting" popup.',           'seed'),
  ('Discord',        'electron',     900, 'Three servers muted, still streaming GIFs to nobody.', 'seed'),
  ('VS Code',        'electron',    1400, 'Six extensions, one file, four helper processes.',     'seed'),
  ('Google Chrome',  'browser-tab',  350, 'Per tab. You have 40.',                                'seed'),
  ('IntelliJ IDEA',  'java',        3200, 'Indexing. Still indexing.',                            'seed'),
  ('Spotify',        'electron',     700, 'To play a 3 MB mp3.',                                  'seed'),
  ('Notion',         'electron',     950, 'Rendering a to-do list.',                              'seed'),
  ('Finder',         'native',       120, 'Honestly fine, included for contrast.',                'seed');
