import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { data, error } = await supabase
        .from('scrapbook_entries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { title, content, entry_date, image_url, tags, submitted_by } = body;

    const { data, error } = await supabase
        .from('scrapbook_entries')
        .insert([{ title, content, entry_date, image_url, tags, submitted_by }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
