export const loginCompany = async (req, res) => {

    try {

        const { email, password } = req.body

        // Check if fields are empty
        if (!email || !password) {
            return res.json({
                success: false,
                message: "Email and Password are required"
            })
        }

        // Find company
        const company = await Company.findOne({ email })

        // If company not found
        if (!company) {
            return res.json({
                success: false,
                message: "Company not found"
            })
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, company.password)

        // Wrong password
        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid password"
            })
        }

        // Generate token
        const token = generateToken(company._id)

        // Success response
        res.json({
            success: true,
            token,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            }
        })

    } catch (error) {

        console.log("Company Login Error:", error)

        res.status(500).json({
            success: false,
            message: error.message
        })

    }

}