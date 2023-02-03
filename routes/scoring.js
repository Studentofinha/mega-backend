const Scoring = require("../models/scoring");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const ID = require("nodejs-unique-numeric-id-generator");

const FILE_TYPE_MAP = {
  "application/pdf": "pdf",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/heic": "heic",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];

    let uploadError = new Error("invalid file type Please select only pdf");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/files");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extention = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extention}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  try {
    const scoringList = await Scoring.find();
    if (!scoringList) {
      res.status(500).json({ success: false });
    }
    res.send(scoringList);
    
  } catch (error) {
    res.send(error);
  }
});

// get method
router.get(`/:id`, async (req, res) => {
  try {
    const scoring = await Scoring.findById(req.params.id);
    if (!scoring) {
      res.status(500).json({ success: false });
    }
    res.send(scoring);
  } catch (error) {
    res.send(error);
  }
});

// post method
router.post(`/`, async (req, res) => {
  try {
    let uniqueId = ID.generate(new Date().toJSON());
    let scoring = new Scoring({
      uniqueId: uniqueId,
      sellerId: req.body.sellerId,
      client_name: req.body.client_name,
      passportSeries: req.body.passportSeries,
      cardNumber: req.body.cardNumber,
      phoneNumber: req.body.phoneNumber,
      date: req.body.date,

      createdAt: req.body.createdAt,
    });

    scoring = await scoring.save();

    if (!scoring)
      return res.status(500).send("The scoring step 1 cannot be created");

    res.send(scoring);
  } catch (error) {
    res.send(error);
  }
});https://davlat-backend.herokuapp.com/api/v1/scoring

router.put(`/code/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid scoring id");
    }

    const scoring = await Scoring.findById(req.params.id);
    if (!scoring) return res.status(400).send("invalid scoring");

    console.log(req.body);

    const updatedScoring = await Scoring.findByIdAndUpdate(
      req.params.id,
      {
        codeConfirmation: req.body.codeConfirmation,
        step: req.body.step,
        statusAdmin: req.body.statusAdmin,
      },
      {
        new: true,
      }
    );
    if (!updatedScoring)
      return res.status(404).send("the scoring cannot be updated");

    res.send(updatedScoring);
  } catch (error) {
    res.send(error);
  }
});

router.put(`/manager/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid id");
    }

    const scoring = await Scoring.findById(req.params.id);
    if (!scoring) return res.status(400).send("invalid scoring");

    // let data = JSON.parse(req.body);
    // console.log(data)
    const updatedScoring = await Scoring.findByIdAndUpdate(
      req.params.id,
      {
        menedjerName: req.body.menedjerName,
        menedjerId: req.body.menedjerId,
        statusAdmin: req.body.statusAdmin,
        acceptAt: req.body.acceptAt,
      },
      {
        new: true,
      }
    );
    if (!updatedScoring)
      return res.status(404).send("the scoring cannot be updated");

    res.send(updatedScoring);
  } catch (error) {
    res.send(error);
  }
});

router.put(`/secondStep/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid scoring id");
    }

    const scoring = await Scoring.findById(req.params.id);
    if (!scoring) return res.status(400).send("invalid scoring");

    const updatedScoring = await Scoring.findByIdAndUpdate(
      req.params.id,
      {
        productName: req.body.productName,
        productPrice: req.body.productPrice,
      },
      {
        new: true,
      }
    );
    if (!updatedScoring)
      return res.status(404).send("the scoring cannot be updated");

    res.send(updatedScoring);
  } catch (error) {
    res.send(error);
  }
});

//uploading two pdf file
router.put(
  "/limit/:id",
  uploadOptions.fields([
    { name: "document1", maxCount: 1 },
    { name: "document2", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send("Invalid document id");
      }

      const scoring = await Scoring.findById(req.params.id);
      if (!scoring) return res.status(400).send("invalid document");

      const files = req.files;
      let filepath_1;
      let filepath_2;
      console.log(files.document1);
      const basePath = `${req.protocol}://${req.get("host")}/public/files/`;
      if (files.document1) {
        const fileName1 = req.files.document1[0].filename;
        filepath_1 = `${basePath}${fileName1}`;
        console.log(files.document1);
      } else {
        filepath_1 = scoring.document1;
      }

      if (files.document2) {
        const fileName2 = req.files.document2[0].filename;
        filepath_2 = `${basePath}${fileName2}`;
      } else {
        filepath_2 = scoring.document2;
      }

      const updatedDocument = await Scoring.findByIdAndUpdate(
        req.params.id,
        {
          limitMoney: req.body.limitMoney,
          statusAdmin: req.body.statusAdmin,
          complatedAt: req.body.complatedAt,
          step: parseInt(req.body.step),
          document1: filepath_1,
          document2: filepath_2,
        },
        {
          new: true,
        }
      );
      if (!updatedDocument)
        return res.status(404).send("the Document cannot be updated");

      res.send(updatedDocument);
    } catch (error) {
      res.send(error);
    }
  }
);
//uploading array

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 5),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send("Invalid document id");
      }
      const files = req.files;
      
      let imagesPaths = [];
      const basePath = `${req.protocol}://${req.get("host")}/public/files/`;
      if (files) {
        files.map((file) => {
          imagesPaths.push(`${basePath}${file.fileName}`);
        });
      }

      const scoring = await Scoring.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
        },
        {
          new: true,
        }
      );

      if (!scoring)
        return res.status(404).send("the scoring cannot be updated");

        res.send(scoring);
    } catch (error) {
      res.send(error);
    }
  }
);

//uploading multipli at the same time
router.put(
  "/fourthStep/:id",
  uploadOptions.fields([{ name: "file", maxCount: 6 }]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send("Invalid document id");
      }

      const scoring = await Scoring.findById(req.params.id);
      if (!scoring) return res.status(400).send("invalid document");

      const files = req.files;
      let filepath;

      const basePath = `${req.protocol}://${req.get("host")}/public/files/`;

      if (files.file) {
        const fileName = req.files.file[0].filename;
        filepath = `${basePath}${fileName}`;
      } else {
        filepath = scoring.file;
      }
      const updatedDocument = await Scoring.findByIdAndUpdate(
        req.params.id,
        {
          file: filepath,

          step: parseInt(req.body.step),
          statusAdmin: req.body.statusAdmin,
        },
        {
          new: true,
        }
      );
      if (!updatedDocument)
        return res.status(404).send("the Document cannot be updated");

      res.send(updatedDocument);
    } catch (error) {
      res.send(error);
    }
  }
);

router.put(`/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid scoring id");
    }

    const scoring = await Scoring.findById(req.params.id);
    if (!scoring) return res.status(400).send("invalid scoring");

    const updatedScoring = await Scoring.findByIdAndUpdate(
      req.params.id,
      {
        limitMoney: req.body.limitMoney,
        passportSeries: req.body.passportSeries,
        phoneNumber: req.body.phoneNumber,
        codeConfirmation: req.body.codeConfirmation,
        step: req.body.step,
        menedjerName: req.body.menedjerName,
        statusAdmin: req.body.statusAdmin,
        acceptAt: req.body.acceptAt,
        productName: req.body.productName,
        productPrice: req.body.productPrice,
      },
      {
        new: true,
      }
    );
    if (!updatedScoring)
      return res.status(404).send("the scoring cannot be updated");

    res.send(updatedScoring);
  } catch (error) {
    res.send(error);
  }
});

router.get(`/download/:doc/:id`, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid scoring id");
    }

    const scoring = await Scoring.findById(req.params.id);
    let doc = req.params.doc;
    let document;
    switch (doc) {
      case "document1":
        document = scoring.document1.replace(
          "http://localhost:8080/public/files/",
          ""
        );
        break;
      case "document2":
        document = scoring.document2.replace(
          "http://localhost:8080/public/files/",
          ""
        );
        break;
      case "file1":
        document = scoring.file1.replace(
          "http://localhost:8080/public/files/",
          ""
        );
        break;
      default:
        return res.status(400).send("invalid field");
    }

    if (!scoring) return res.status(400).send("invalid scoring");

    res.download(`./public/files/${document}`, function (err) {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    res.send(error);
  }
});

router.get(`/seller/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid Seller id");
    }

    const scoringList = await Scoring.find();

    let sellerDocsList = [];
    scoringList.map((doc) => {
      if (doc.sellerId === req.params.id) sellerDocsList.push(doc);
    });

    res.send(sellerDocsList);
  } catch (error) {
    res.send(error);
  }
});

router.get(`/manager/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid Manager id");
    }

    const scoringList = await Scoring.find();

    let managerDocsList = [];
    scoringList.map((doc) => {
      if (doc.menedjerId === req.params.id) managerDocsList.push(doc);
    });

    res.send(managerDocsList);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/:id", (req, res) => {
  try {
    Scoring.findByIdAndRemove({ _id: req.params.id })
      .then((scoring) => {
        if (scoring) {
          return res
            .status(200)
            .json({ success: true, message: "The data is deleted" });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "data not found" });
        }
      })
      .catch((err) => {
        return res.status(400).json({ success: false, err: err });
      });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
