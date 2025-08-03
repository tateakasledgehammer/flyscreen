export default function Import() {
    return (
        <>
            <h1><i className="fa-solid fa-upload"></i> Import Your Studies</h1>

            <input type="file" accept=".ris" />

            {/* add upload status <p> for when there is an upload to confirm */}

            <div>
                <h3>Uploaded Studies</h3>
                {/* add list for history of uploads */}
                <ul>
                    <li>XX uploaded on XX with XX studies</li>
                    <li>XX uploaded on XX with XX studies</li>
                    <li>XX uploaded on XX with XX studies</li>
                    <li>XX uploaded on XX with XX studies</li>
                </ul>
            </div>

        </>
    )
}