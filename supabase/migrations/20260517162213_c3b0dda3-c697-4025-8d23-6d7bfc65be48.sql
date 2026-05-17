UPDATE auth.users
SET encrypted_password = crypt('senha123', gen_salt('bf')),
    updated_at = now()
WHERE id = 'bf41b5c0-cec8-418c-b1ac-ae1d53b2188b';